export const PIPELINE_SYSTEM_PROMPT = `You are a world-class AI Film Director and Story Analyst. 
Your task is to take a transcript of a voiceover and convert it into an intelligent scene-by-scene storyboard plan.
Output strict JSON matching the schema requested.
`;

export const PIPELINE_INSTRUCTION_PROMPT = `Analyze the following transcript and generate a structured Scene JSON array.
Divide the narration into logical scenes (2-5 seconds each, usually one idea per scene). Do NOT just split every sentence; understand the context.

For each scene, provide:
1. sceneNumber (number, 1-indexed)
2. startTime (number, seconds)
3. endTime (number, seconds)
4. duration (number, seconds)
5. narration (string, exact text)
6. subtitle (string, clean easy reading)
7. summary (string, short description)
8. emotion (string)
9. emotionConfidence (number, 0 to 1)
10. characters (array of strings, e.g. ["character_001"])
11. actions (array of strings)
12. environment (string)
13. props (array of strings)
14. camera (object with "angle" and "movement")
15. visualPrompt (string, detailed prompt for video generation)
16. priority (string: "high", "medium", "low")

Ensure absolute consistency of character IDs across scenes (e.g. if the main character is character_001, refer to them as such in all scenes).

Return a JSON array of these scene objects.
`;
