/**
 * Very simple pseudo-random 1D noise generator for procedural secondary motion.
 * Used for subtle organic movements (breathing, shivering, natural sway).
 */
export class Noise {
  // A simple sine wave composite to simulate organic noise without a full Simplex implementation
  public static organic1D(timeMs: number, speed: number = 0.001, amplitude: number = 1.0, seedOffset: number = 0): number {
    const t = (timeMs * speed) + seedOffset;
    
    // Combine 3 sine waves at non-integer harmonic frequencies for pseudo-randomness
    const w1 = Math.sin(t);
    const w2 = Math.sin(t * 1.618) * 0.5; // Golden ratio frequency
    const w3 = Math.sin(t * 2.718) * 0.25; // Euler's number frequency

    // Normalize roughly to [-1, 1] range then multiply by amplitude
    return ((w1 + w2 + w3) / 1.75) * amplitude;
  }

  // Pure sine wave for rhythmic things like breathing
  public static rhythmic(timeMs: number, frequencyHz: number, amplitude: number = 1.0, phaseOffetStr: number = 0): number {
    const hz = timeMs / 1000 * frequencyHz * Math.PI * 2;
    return Math.sin(hz + phaseOffetStr) * amplitude;
  }
}
