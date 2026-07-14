import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { generateChecksum, validateExport, generateDiagnosticsBundle } from '@/services/export/validate';

interface RenderJob {
  id: string;
  projectId: string;
  status: 'queued' | 'rendering' | 'done' | 'failed';
  progress: number;
  outputFile?: string;
  manifestFile?: string;
  diagnosticsFile?: string;
  logs: string[];
}

const renderQueue: Record<string, RenderJob> = {};

export async function POST(req: NextRequest) {
  try {
    const { project, quality = 'standard' } = await req.json();

    if (!project || !project.id) {
      return NextResponse.json({ error: 'Missing project data' }, { status: 400 });
    }

    const jobId = `job_${Date.now()}_${project.id}`;
    renderQueue[jobId] = { 
      id: jobId, 
      projectId: project.id, 
      status: 'queued', 
      progress: 0,
      logs: []
    };

    // Kick off render asynchronously
    startRenderJobWithRetries(jobId, project, quality, 3);

    return NextResponse.json({ success: true, jobId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId || !renderQueue[jobId]) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Omit logs from polling to save bandwidth
  const { logs, ...jobData } = renderQueue[jobId];
  return NextResponse.json(jobData);
}

async function startRenderJobWithRetries(jobId: string, project: any, quality: string, maxAttempts: number) {
  let attempt = 1;
  const job = renderQueue[jobId];

  while (attempt <= maxAttempts) {
    try {
      job.status = 'rendering';
      job.logs.push(`[System] Starting render attempt ${attempt}/${maxAttempts} for quality: ${quality}`);
      
      await runRenderPipeline(job, project, quality);
      
      // If we reach here, it succeeded
      return;
    } catch (error: any) {
      job.logs.push(`[Error] Attempt ${attempt} failed: ${error.message}`);
      if (error.stack) job.logs.push(`[Stack] ${error.stack}`);
      
      if (attempt === maxAttempts) {
        job.status = 'failed';
        job.logs.push(`[System] Max retries reached. Export failed.`);
        
        // Generate diagnostics bundle
        const diagnosticsFile = generateDiagnosticsBundle(jobId, project.id, error, job.logs, {
          quality,
          projectId: project.id
        });
        job.diagnosticsFile = diagnosticsFile;
        break;
      }
      
      // Wait before retry
      job.logs.push(`[System] Waiting 3 seconds before retry...`);
      await new Promise(r => setTimeout(r, 3000));
      job.progress = 0;
      attempt++;
    }
  }
}

async function runRenderPipeline(job: RenderJob, project: any, quality: string) {
  const exportsDir = path.join(process.cwd(), 'public', 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const outputPath = path.join(exportsDir, `${job.id}_final.mp4`);
  const manifestPath = path.join(exportsDir, `${job.id}_manifest.json`);

  job.logs.push(`[Bundler] Starting Webpack bundling of remotion/index.ts...`);
  
  // 1. Bundle
  const bundled = await bundle({
    entryPoint: path.resolve(process.cwd(), 'remotion/index.ts'),
    webpackOverride: (config) => config,
  });
  
  job.logs.push(`[Bundler] Bundling complete. output: ${bundled}`);

  let composition: any;
  let crf = 22;

  // 2. Setup Composition
  job.logs.push(`[Renderer] Selecting composition Voice2ShortMovie...`);
  composition = await selectComposition({
    serveUrl: bundled,
    id: 'Voice2ShortMovie',
    port: 3333,
    inputProps: {
      project,
      baseAudioUrl: project.audioUrl || ''
    }
  });

  job.logs.push(`[Renderer] Composition found. Duration: ${composition.durationInFrames} frames`);

  // Map quality to CRF (lower is better)
  if (quality === 'draft') crf = 28;
  if (quality === 'hq') crf = 16;

  job.logs.push(`[Renderer] Starting FFmpeg render (Codec: h264, CRF: ${crf})...`);

  // 3. Render Media
  await renderMedia({
    composition,
    serveUrl: bundled,
    port: 3333,
    codec: 'h264',
    outputLocation: outputPath,
    crf,
    inputProps: {
      project,
      baseAudioUrl: project.audioUrl || ''
    },
    onProgress: (p) => {
      if (composition) {
        job.progress = p.renderedFrames / composition.durationInFrames;
      }
    },
  });

  job.logs.push(`[Renderer] RenderMedia completed successfully.`);
  job.logs.push(`[Validation] Running ffprobe validation...`);

  // 4. Validate output
  const validation = await validateExport(outputPath);
  if (!validation.isValid) {
    throw new Error(`Export Validation Failed: ${validation.error}`);
  }

  job.logs.push(`[Validation] FFprobe confirmed valid MP4. Size: ${validation.sizeBytes} bytes`);

  // 5. Generate Checksum & Manifest
  job.logs.push(`[Manifest] Generating SHA-256 Checksum...`);
  const checksum = await generateChecksum(outputPath);

  const manifestData = {
    jobId: job.id,
    projectId: project.id,
    timestamp: new Date().toISOString(),
    fps: composition.fps,
    resolution: `${composition.width}x${composition.height}`,
    quality,
    crf,
    engine: 'Remotion + FFmpeg',
    fileSize: validation.sizeBytes,
    checksumSha256: checksum,
    metadata: validation.metadata
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
  job.logs.push(`[Manifest] Manifest generated at ${manifestPath}`);

  // 6. Complete
  job.status = 'done';
  job.progress = 1;
  job.outputFile = `/exports/${job.id}_final.mp4`;
  job.manifestFile = `/exports/${job.id}_manifest.json`;
}
