import { NextRequest, NextResponse } from 'next/server';
import { AIPipeline } from '@/services/ai/pipeline';
import { SemanticMatcher } from '@/services/assets/SemanticMatcher';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    const pipeline = new AIPipeline();
    const scenes = await pipeline.processAudio(base64, file.type);

    // Apply Semantic Asset Matching to each scene
    const matcher = new SemanticMatcher();
    const enrichedScenes = scenes.map(scene => ({
      ...scene,
      composition: matcher.generateCompositionPlan(scene)
    }));

    // Save audio to public/uploads
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const fileName = `audio_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    const audioUrl = `/uploads/${fileName}`;

    return NextResponse.json({ success: true, scenes: enrichedScenes, audioUrl });
  } catch (error: any) {
    console.error("API Pipeline Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
