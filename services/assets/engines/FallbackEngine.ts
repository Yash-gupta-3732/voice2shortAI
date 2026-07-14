/**
 * Fallback Engine — Semantic Synonym Graph
 * Maps any search term to a prioritised chain of synonyms.
 * This allows the matcher to gracefully degrade without LLM calls.
 */

// ─── Synonym Graph ────────────────────────────────────────────────────────────
// Each key maps to ordered fallback terms (highest to lowest similarity)
const SYNONYM_GRAPH: Record<string, string[]> = {
  // ── Emotions ──────────────────────────────────────────────────────────────
  happy:      ['excited', 'joyful', 'cheerful', 'elated', 'calm'],
  joyful:     ['happy', 'excited', 'cheerful'],
  excited:    ['happy', 'joyful', 'surprised'],
  cheerful:   ['happy', 'joyful', 'calm'],
  elated:     ['excited', 'happy'],
  sad:        ['crying', 'depressed', 'fearful', 'bored', 'neutral'],
  crying:     ['sad', 'fearful'],
  depressed:  ['sad', 'bored', 'fearful'],
  angry:      ['frustrated', 'furious', 'intense'],
  frustrated: ['angry', 'confused'],
  fearful:    ['scared', 'anxious', 'sad'],
  scared:     ['fearful', 'anxious'],
  surprised:  ['shocked', 'excited', 'confused'],
  shocked:    ['surprised', 'fearful'],
  calm:       ['peaceful', 'neutral', 'relaxed'],
  peaceful:   ['calm', 'neutral'],
  relaxed:    ['calm', 'neutral'],
  bored:      ['neutral', 'sad', 'calm'],
  confused:   ['thinking', 'neutral', 'frustrated'],
  neutral:    ['calm', 'bored'],

  // ── Actions / Animations ──────────────────────────────────────────────────
  running:    ['fast_walking', 'jogging', 'sprinting', 'walking'],
  jogging:    ['running', 'walking'],
  sprinting:  ['running', 'fast_walking'],
  walking:    ['strolling', 'slow_walking', 'moving', 'jogging'],
  strolling:  ['walking', 'slow_walking'],
  standing:   ['idle', 'waiting', 'posing'],
  idle:       ['standing', 'waiting'],
  sitting:    ['resting', 'relaxing', 'seated'],
  resting:    ['sitting', 'relaxing'],
  jumping:    ['leaping', 'hopping'],
  leaping:    ['jumping', 'running'],
  talking:    ['speaking', 'conversing', 'gesturing'],
  speaking:   ['talking', 'presenting'],
  listening:  ['attention', 'hearing', 'thinking'],
  pointing:   ['gesturing', 'indicating', 'directing'],
  thinking:   ['pondering', 'confused', 'listening'],
  waving:     ['greeting', 'gesturing', 'farewell'],
  greeting:   ['waving', 'handshake'],
  dancing:    ['moving', 'celebrating', 'excited'],
  celebrating:['dancing', 'excited', 'happy'],
  swimming:   ['floating', 'diving'],
  sleeping:   ['resting', 'lying'],
  lying:      ['sleeping', 'resting'],

  // ── Environments / Backgrounds ────────────────────────────────────────────
  park:       ['garden', 'outdoor', 'nature', 'forest', 'field'],
  garden:     ['park', 'outdoor', 'nature'],
  forest:     ['park', 'nature', 'woods', 'outdoor'],
  woods:      ['forest', 'nature'],
  beach:      ['ocean', 'sea', 'shore', 'outdoor'],
  ocean:      ['beach', 'sea'],
  sea:        ['ocean', 'beach'],
  mountain:   ['hill', 'outdoor', 'nature'],
  field:      ['park', 'outdoor', 'nature'],
  city:       ['street', 'urban', 'downtown', 'outdoor'],
  street:     ['city', 'urban', 'road'],
  urban:      ['city', 'street'],
  downtown:   ['city', 'urban'],
  office:     ['modern_office', 'workplace', 'indoor'],
  modern_office: ['office', 'workplace', 'indoor'],
  luxury_office: ['modern_office', 'office', 'indoor'],
  workplace:  ['office', 'indoor'],
  home:       ['house', 'room', 'indoor', 'living_room'],
  house:      ['home', 'indoor'],
  room:       ['home', 'indoor'],
  living_room:['home', 'indoor'],
  bedroom:    ['home', 'indoor'],
  school:     ['classroom', 'indoor', 'education'],
  classroom:  ['school', 'indoor'],
  hospital:   ['clinic', 'medical', 'indoor'],
  clinic:     ['hospital', 'medical', 'indoor'],
  space:      ['cosmic', 'galaxy', 'universe', 'outdoor'],
  cosmic:     ['space', 'galaxy'],

  // ── Props ─────────────────────────────────────────────────────────────────
  phone:      ['smartphone', 'mobile', 'device'],
  smartphone: ['phone', 'mobile', 'device'],
  laptop:     ['computer', 'device', 'tablet'],
  computer:   ['laptop', 'device'],
  coffee:     ['drink', 'cup', 'mug'],
  mug:        ['coffee', 'cup', 'drink'],
  book:       ['textbook', 'notebook', 'reading'],
  notebook:   ['book', 'writing'],
  bag:        ['backpack', 'satchel', 'luggage'],
  backpack:   ['bag', 'satchel'],
  sword:      ['blade', 'weapon', 'katana'],
  gun:        ['weapon', 'pistol', 'firearm'],
  shield:     ['armor', 'defense'],
  apple:      ['fruit', 'food'],
  food:       ['apple', 'snack'],
  car:        ['vehicle', 'transport'],
  vehicle:    ['car', 'transport'],
  hat:        ['cap', 'headwear', 'accessory'],
  cap:        ['hat', 'headwear'],

  // ── Camera ────────────────────────────────────────────────────────────────
  close_up:   ['closeup', 'tight', 'portrait', 'medium'],
  medium:     ['mid_shot', 'half_body', 'normal'],
  wide:       ['full_body', 'long_shot', 'establishing'],
  extreme_wide: ['wide', 'establishing', 'aerial'],
  dutch_angle:  ['tilted', 'dramatic', 'cinematic'],

  // ── Lighting ─────────────────────────────────────────────────────────────
  day_soft:   ['daylight', 'natural', 'bright', 'outdoor_light'],
  daylight:   ['day_soft', 'natural', 'bright'],
  night_neon: ['night', 'neon', 'dark', 'artificial'],
  night:      ['night_neon', 'dark', 'low_light'],
  sunset_warm:['sunset', 'warm', 'golden_hour'],
  indoor_fluorescent: ['indoor', 'artificial', 'office_light'],
  dramatic_spot: ['dramatic', 'spot', 'theatrical'],
};

export class FallbackEngine {
  /**
   * Returns ordered fallback synonyms for a given search term
   */
  public getSynonyms(term: string): string[] {
    const normalized = term.toLowerCase().replace(/ /g, '_');
    const direct = SYNONYM_GRAPH[normalized] || [];

    // Reverse lookup — terms that point TO this term
    const reverse = Object.entries(SYNONYM_GRAPH)
      .filter(([, syns]) => syns.includes(normalized))
      .map(([key]) => key)
      .filter(k => !direct.includes(k));

    return [...direct, ...reverse];
  }

  /**
   * Semantic distance score between two terms.
   * 1.0 = exact match, 0.8 = direct synonym, 0.6 = reverse synonym, 0.1 = no relation
   */
  public getDistance(term1: string, term2: string): number {
    const t1 = term1.toLowerCase().replace(/ /g, '_');
    const t2 = term2.toLowerCase().replace(/ /g, '_');

    if (t1 === t2) return 1.0;

    const syns = SYNONYM_GRAPH[t1] || [];
    const idx = syns.indexOf(t2);
    if (idx !== -1) {
      // Decay score by position in synonym chain: first synonym = 0.85, last ≈ 0.55
      return Math.max(0.55, 0.85 - idx * 0.05);
    }

    // Reverse lookup
    const reverseSyns = SYNONYM_GRAPH[t2] || [];
    if (reverseSyns.includes(t1)) return 0.6;

    return 0.0;
  }

  /**
   * Get the full fallback chain for a set of target terms with scores
   */
  public getChain(terms: string[]): { term: string; score: number }[] {
    const seen = new Set<string>();
    const chain: { term: string; score: number }[] = [];

    for (const term of terms) {
      if (!seen.has(term)) { chain.push({ term, score: 1.0 }); seen.add(term); }
      for (const syn of this.getSynonyms(term)) {
        if (!seen.has(syn)) {
          chain.push({ term: syn, score: this.getDistance(term, syn) });
          seen.add(syn);
        }
      }
    }

    return chain.sort((a, b) => b.score - a.score);
  }
}
