import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = await ai.models.list();
  // @ts-ignore
  console.log(models.map(m => m.name).filter(n => n.includes('gemini')));
}

listModels().catch(console.error);
