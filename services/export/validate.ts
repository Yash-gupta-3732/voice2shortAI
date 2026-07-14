import crypto from 'crypto';
import fs from 'fs';
import { getVideoMetadata } from '@remotion/renderer';

export async function generateChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export async function validateExport(filePath: string) {
  try {
    // getVideoMetadata uses ffprobe under the hood to read the file
    // If the moov atom is missing or the file is corrupted, this will throw an error
    const metadata = await getVideoMetadata(filePath);
    
    return {
      isValid: true,
      metadata,
      sizeBytes: fs.statSync(filePath).size,
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message,
    };
  }
}

export function generateDiagnosticsBundle(
  jobId: string, 
  projectId: string, 
  error: any, 
  logs: string[],
  manifestData: any
) {
  const diagnostics = {
    jobId,
    projectId,
    timestamp: new Date().toISOString(),
    error: error?.message || String(error),
    stack: error?.stack,
    manifest: manifestData,
    logs,
  };

  const diagnosticsPath = `${process.cwd()}/public/exports/${jobId}_diagnostics.json`;
  fs.writeFileSync(diagnosticsPath, JSON.stringify(diagnostics, null, 2));
  
  return `/exports/${jobId}_diagnostics.json`;
}
