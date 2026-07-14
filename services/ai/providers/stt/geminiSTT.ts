import { STTProvider } from './sttProvider';
import { getGeminiClient } from '../../geminiClient';

export class GeminiSTTProvider implements STTProvider {
  async transcribe(audioBase64: string, mimeType: string) {
    const ai = getGeminiClient();
    
    // Using gemini-1.5-pro for best audio understanding
    const prompt = `Transcribe the following audio accurately. Preserve timestamps for each spoken segment. Return ONLY a JSON array of objects with the following schema:
[{ "text": "string", "startTime": number, "endTime": number }]
Remove filler words, correct grammar, and detect sentence boundaries.`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: audioBase64 } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("Gemini STT returned empty response");
    }

    try {
      return JSON.parse(response.text);
    } catch (e) {
      throw new Error("Failed to parse Gemini STT JSON response: " + response.text);
    }
  }
}
