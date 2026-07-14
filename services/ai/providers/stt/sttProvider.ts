export interface STTProvider {
  /**
   * Transcribes audio into timestamped segments.
   * @param audioBase64 The base64 encoded audio string
   * @param mimeType The audio mime type
   * @returns Array of text segments with start and end times in seconds
   */
  transcribe(audioBase64: string, mimeType: string): Promise<{ text: string, startTime: number, endTime: number }[]>;
}
