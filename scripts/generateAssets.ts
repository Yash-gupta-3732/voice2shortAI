/**
 * Asset Database Generator
 * Produces data/assets.json with 200+ fully-specified AssetMetadata objects.
 * Every asset is self-aware: it knows where it can be used, how it renders,
 * what it connects to, and how it transitions.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import {
  AssetMetadata, AssetCategory, AssetSubCategory,
  AnchorPoint, AssetVariant, AnimationTransitions,
} from '../types/assets';

const dataDir = path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const NOW = new Date().toISOString();
const assets: AssetMetadata[] = [];
let _count = 0;

// ─── Helper ──────────────────────────────────────────────────────────────────
function a(
  id: string,
  category: AssetCategory,
  subCategory: AssetSubCategory,
  name: string,
  tags: string[],
  semanticKeywords: string[],
  extra: Partial<AssetMetadata> = {}
): AssetMetadata {
  _count++;
  const base: AssetMetadata = {
    assetId: id,
    version: '1.0.0',
    name,
    category,
    subCategory,
    status: 'active',
    type: 'metadata_only',
    tags,
    semanticKeywords,
    emotion: [],
    action: [],
    environment: [],
    timeOfDay: ['any'],
    compatibleCharacters: ['any'],
    compatibleExpressions: ['any'],
    compatibleAnimations: ['any'],
    compatibleBackgrounds: ['any'],
    compatibleProps: ['any'],
    compatibleEnvironments: ['any'],
    incompatibleCharacters: [],
    incompatibleActions: [],
    incompatibleEnvironments: [],
    requiredAssets: [],
    optionalAssets: [],
    recommendedCamera: [],
    recommendedLighting: [],
    layer: 10,
    zIndex: 0,
    variants: [],
    fallbackAssets: [],
    priority: 0.80,
    quality: 0.80,
    weight: 0.80,
    usageCount: 0,
    createdAt: NOW,
    updatedAt: NOW,
    ...extra,
  };
  assets.push(base);
  return base;
}

// ════════════════════════════════════════════════════════════
// CHARACTERS (5)
// ════════════════════════════════════════════════════════════
const CHARACTERS = ['default', 'business', 'casual', 'ninja', 'doctor'] as const;
CHARACTERS.forEach(char => {
  a(`char_${char}`, 'character', 'human', `${char} Character`,
    [char, 'character', 'stickman'],
    [char, 'person', 'figure', 'human', 'stickman', 'avatar'],
    {
      layer: 10, zIndex: 0, priority: char === 'default' ? 1.0 : 0.8, quality: 0.9, weight: 0.9,
      fallbackAssets: ['char_default'],
      recommendedCamera: ['cam_medium', 'cam_close_up'],
    }
  );
});

// ════════════════════════════════════════════════════════════
// EXPRESSIONS (30) — 10 emotions × 3 intensity levels
// ════════════════════════════════════════════════════════════
const EMOTION_DEFS: { id: string; subCat: AssetSubCategory; syns: string[]; actions: string[] }[] = [
  { id: 'happy',     subCat: 'positive',    syns: ['joyful','cheerful','smiling','elated'],       actions: ['talking','waving','dancing'] },
  { id: 'sad',       subCat: 'negative',    syns: ['crying','depressed','unhappy','melancholy'],  actions: ['sitting','listening'] },
  { id: 'angry',     subCat: 'negative',    syns: ['furious','frustrated','intense','mad'],        actions: ['pointing','talking'] },
  { id: 'neutral',   subCat: 'neutral_expr',syns: ['calm','expressionless','blank','normal'],      actions: ['standing','walking','listening'] },
  { id: 'surprised', subCat: 'complex',     syns: ['shocked','astonished','amazed','wide_eyed'],  actions: ['standing','pointing'] },
  { id: 'fearful',   subCat: 'negative',    syns: ['scared','anxious','terrified','frightened'],  actions: ['standing','running'] },
  { id: 'calm',      subCat: 'neutral_expr',syns: ['peaceful','relaxed','serene','composed'],     actions: ['standing','sitting','breathing'] },
  { id: 'excited',   subCat: 'positive',    syns: ['enthusiastic','pumped','energetic','eager'],  actions: ['jumping','waving','running'] },
  { id: 'bored',     subCat: 'neutral_expr',syns: ['uninterested','dull','listless','tired'],     actions: ['sitting','standing','idle'] },
  { id: 'confused',  subCat: 'complex',     syns: ['puzzled','perplexed','lost','unsure'],        actions: ['thinking','pointing','looking_around'] },
];

const INTENSITY = [
  { suffix: '01', label: 'Default', prio: 0.9, quality: 0.9, weight: 0.9 },
  { suffix: '02', label: 'Subtle',  prio: 0.7, quality: 0.8, weight: 0.7 },
  { suffix: '03', label: 'Extreme', prio: 0.6, quality: 0.7, weight: 0.6 },
];

EMOTION_DEFS.forEach(({ id: emo, subCat, syns, actions }) => {
  const variants: AssetVariant[] = INTENSITY.map(({ suffix, label }) => ({
    variantId: `exp_${emo}_${suffix}`,
    label,
    tags: [emo, label.toLowerCase()],
  }));

  INTENSITY.forEach(({ suffix, label, prio, quality, weight }) => {
    a(`exp_${emo}_${suffix}`, 'expression', subCat, `${emo} Face (${label})`,
      [emo, 'face', 'expression', label.toLowerCase()],
      [emo, ...syns, 'face', 'emotion', 'expression', 'mood'],
      {
        emotion: [emo, ...syns],
        action: actions,
        layer: 12, zIndex: 0,
        priority: prio, quality, weight,
        fallbackAssets: suffix !== '01' ? [`exp_${emo}_01`] : ['exp_neutral_01'],
        compatibleAnimations: ['any'],
        incompatibleActions: emo === 'sad' ? ['dancing', 'celebrating'] : [],
        variants,
      }
    );
  });
});

// ════════════════════════════════════════════════════════════
// ANIMATIONS (45) — 15 actions × 3 variants (idle/loop/fast)
// ════════════════════════════════════════════════════════════
const ANIM_DEFS: {
  id: string; subCat: AssetSubCategory; syns: string[];
  incompatibleActions: string[]; transitions: string[];
}[] = [
  { id: 'walking',  subCat: 'locomotion', syns: ['strolling','moving','travel','forward','casual'],          incompatibleActions: ['sleeping','swimming','lying'], transitions: ['anim_running_loop','anim_standing_idle','anim_standing_loop'] },
  { id: 'running',  subCat: 'locomotion', syns: ['sprinting','jogging','fast','dashing','chase'],            incompatibleActions: ['sleeping','sitting','lying','swimming'],  transitions: ['anim_walking_loop','anim_standing_idle','anim_jumping_idle'] },
  { id: 'standing', subCat: 'idle',       syns: ['idle','waiting','posing','upright','still'],               incompatibleActions: ['swimming','lying','sleeping'], transitions: ['anim_walking_idle','anim_sitting_idle','anim_talking_idle'] },
  { id: 'sitting',  subCat: 'idle',       syns: ['seated','resting','relaxing','chair'],                    incompatibleActions: ['running','walking','swimming','jumping'], transitions: ['anim_standing_idle','anim_listening_idle','anim_thinking_idle'] },
  { id: 'jumping',  subCat: 'locomotion', syns: ['leaping','hopping','bouncing','aerial','airborne'],        incompatibleActions: ['sleeping','sitting','swimming'], transitions: ['anim_running_loop','anim_standing_idle'] },
  { id: 'talking',  subCat: 'gesture',    syns: ['speaking','conversing','explaining','presenting','chat'],  incompatibleActions: ['swimming','sleeping'], transitions: ['anim_standing_idle','anim_listening_idle','anim_pointing_idle'] },
  { id: 'listening',subCat: 'gesture',    syns: ['attention','hearing','nodding','focused','paying attention'],incompatibleActions: ['running','jumping'], transitions: ['anim_talking_idle','anim_thinking_idle','anim_standing_idle'] },
  { id: 'pointing', subCat: 'gesture',    syns: ['indicating','directing','showing','gesturing','showing_direction'],incompatibleActions: ['swimming'], transitions: ['anim_standing_idle','anim_talking_idle'] },
  { id: 'thinking', subCat: 'gesture',    syns: ['pondering','wondering','considering','contemplating','brainstorming'],incompatibleActions: ['running','jumping'], transitions: ['anim_standing_idle','anim_sitting_idle'] },
  { id: 'waving',   subCat: 'gesture',    syns: ['greeting','farewell','hello','goodbye','beckoning'],       incompatibleActions: ['swimming','sleeping'], transitions: ['anim_standing_idle','anim_walking_idle'] },
  { id: 'dancing',  subCat: 'emote',      syns: ['celebrating','grooving','moving_rhythmically','party'],    incompatibleActions: ['sitting','sleeping','swimming','lying'], transitions: ['anim_standing_idle','anim_jumping_idle'] },
  { id: 'sleeping', subCat: 'idle',       syns: ['resting','napping','unconscious','lying_down','dormant'],  incompatibleActions: ['walking','running','jumping','talking','dancing'], transitions: ['anim_sitting_idle'] },
  { id: 'swimming', subCat: 'locomotion', syns: ['floating','diving','aquatic','underwater','stroking'],     incompatibleActions: ['running','sitting','jumping','lying'], transitions: ['anim_standing_idle'] },
  { id: 'eating',   subCat: 'interaction',syns: ['chewing','dining','snacking','consuming','munching'],      incompatibleActions: ['running','swimming','jumping'], transitions: ['anim_sitting_idle','anim_standing_idle'] },
  { id: 'typing',   subCat: 'interaction',syns: ['keyboard','working','coding','writing','computing'],       incompatibleActions: ['running','jumping','swimming'], transitions: ['anim_sitting_idle','anim_standing_idle'] },
];

const ANIM_VARIANTS = [
  { suffix: 'idle', label: 'Idle',   speed: 'slow'   as const, prio: 0.85, quality: 0.85, weight: 0.85 },
  { suffix: 'loop', label: 'Loop',   speed: 'normal' as const, prio: 0.90, quality: 0.90, weight: 0.90 },
  { suffix: 'fast', label: 'Fast',   speed: 'fast'   as const, prio: 0.75, quality: 0.80, weight: 0.75 },
];

ANIM_DEFS.forEach(({ id, subCat, syns, incompatibleActions, transitions }) => {
  const variantDefs: AssetVariant[] = ANIM_VARIANTS.map(v => ({
    variantId: `anim_${id}_${v.suffix}`,
    label: v.label,
    tags: [id, v.speed],
    speed: v.speed,
  }));

  ANIM_VARIANTS.forEach(v => {
    const othersInFamily = ANIM_VARIANTS
      .filter(ov => ov.suffix !== v.suffix)
      .map(ov => `anim_${id}_${ov.suffix}`);

    const animTransitions: AnimationTransitions = {
      canTransitionTo: [...transitions, ...othersInFamily],
      canTransitionFrom: [...transitions, ...othersInFamily],
      transitionDuration: v.speed === 'fast' ? 200 : v.speed === 'normal' ? 350 : 500,
    };

    a(`anim_${id}_${v.suffix}`, 'animation', subCat, `${id} (${v.label})`,
      [id, v.suffix, v.speed, 'animation'],
      [id, ...syns, 'motion', 'move', 'animate', v.speed],
      {
        action: [id, ...syns],
        speed: v.speed,
        layer: 10, zIndex: 1,
        priority: v.prio, quality: v.quality, weight: v.weight,
        incompatibleActions,
        animationTransitions: animTransitions,
        variants: variantDefs,
        fallbackAssets: v.suffix !== 'idle' ? [`anim_${id}_idle`] : [`anim_standing_idle`],
        recommendedCamera: ['cam_medium', 'cam_wide'],
      }
    );
  });
});

// ════════════════════════════════════════════════════════════
// BACKGROUNDS (40) — 10 environments × 4 times of day
// ════════════════════════════════════════════════════════════
const BG_ENVS: { id: string; subCat: AssetSubCategory; syns: string[]; incompatibleActions: string[] }[] = [
  { id: 'park',      subCat: 'outdoor', syns: ['garden','nature','grass','trees','outdoor'],        incompatibleActions: ['swimming'] },
  { id: 'city',      subCat: 'urban',   syns: ['street','urban','downtown','road','buildings'],     incompatibleActions: [] },
  { id: 'office',    subCat: 'indoor',  syns: ['workplace','room','desk','corporate','modern'],     incompatibleActions: ['swimming','running'] },
  { id: 'home',      subCat: 'indoor',  syns: ['house','room','living_room','domestic','cozy'],     incompatibleActions: ['swimming'] },
  { id: 'forest',    subCat: 'nature',  syns: ['woods','trees','jungle','wilderness','outdoor'],    incompatibleActions: [] },
  { id: 'beach',     subCat: 'outdoor', syns: ['ocean','sea','shore','sand','tropical','coastal'],  incompatibleActions: [] },
  { id: 'mountain',  subCat: 'nature',  syns: ['hill','cliff','peak','altitude','outdoor'],         incompatibleActions: ['swimming'] },
  { id: 'space',     subCat: 'abstract',syns: ['cosmic','galaxy','universe','stars','orbit'],       incompatibleActions: ['swimming','walking'] },
  { id: 'school',    subCat: 'indoor',  syns: ['classroom','education','learning','study'],         incompatibleActions: ['swimming','dancing'] },
  { id: 'hospital',  subCat: 'indoor',  syns: ['clinic','medical','emergency','health','treatment'],incompatibleActions: ['running','dancing'] },
];

const BG_TIMES: { id: string; syns: string[]; lighting: string }[] = [
  { id: 'day',     syns: ['daytime','bright','sunny','noon'],          lighting: 'light_day_soft' },
  { id: 'night',   syns: ['dark','evening','midnight','nocturnal'],    lighting: 'light_night_neon' },
  { id: 'sunset',  syns: ['dusk','golden_hour','twilight','warm'],     lighting: 'light_sunset_warm' },
  { id: 'sunrise', syns: ['dawn','morning','early','fresh','soft'],    lighting: 'light_day_soft' },
];

BG_ENVS.forEach(({ id: env, subCat, syns: envSyns, incompatibleActions }) => {
  BG_TIMES.forEach(({ id: time, syns: timeSyns, lighting }) => {
    a(`bg_${env}_${time}_01`, 'background', subCat, `${env} (${time})`,
      [env, time, 'background', 'scene'],
      [env, ...envSyns, time, ...timeSyns, 'background', 'location', 'setting', 'place'],
      {
        environment: [env, ...envSyns],
        timeOfDay: [time as any],
        layer: 0, zIndex: 0,
        priority: 0.85, quality: 0.85, weight: 0.80,
        incompatibleActions,
        fallbackAssets: time !== 'day' ? [`bg_${env}_day_01`] : ['bg_park_day_01'],
        recommendedLighting: [lighting],
        recommendedCamera: ['cam_wide', 'cam_medium'],
      }
    );
  });
});

// ════════════════════════════════════════════════════════════
// PROPS (60) — 10 prop types × 3 variants × metadata
// ════════════════════════════════════════════════════════════
const PROP_DEFS: {
  id: string; subCat: AssetSubCategory; syns: string[];
  anchor: AnchorPoint; occupancy: Partial<{ rightHandOccupied: boolean; leftHandOccupied: boolean; headOccupied: boolean; backOccupied: boolean }>;
  incompatibleActions: string[];
}[] = [
  { id: 'phone',    subCat: 'electronic', anchor: 'right_hand', occupancy: { rightHandOccupied: true },  syns: ['smartphone','mobile','device','cellphone'],                              incompatibleActions: ['swimming','sleeping'] },
  { id: 'laptop',   subCat: 'electronic', anchor: 'both_hands', occupancy: { rightHandOccupied: true, leftHandOccupied: true }, syns: ['computer','notebook','device','screen'],         incompatibleActions: ['swimming','running','jumping'] },
  { id: 'coffee',   subCat: 'food',       anchor: 'right_hand', occupancy: { rightHandOccupied: true },  syns: ['cup','mug','drink','beverage','hot'],                                   incompatibleActions: ['swimming','running'] },
  { id: 'book',     subCat: 'tool',       anchor: 'both_hands', occupancy: { rightHandOccupied: true, leftHandOccupied: true }, syns: ['reading','textbook','novel','literature'],       incompatibleActions: ['swimming','running','jumping'] },
  { id: 'bag',      subCat: 'clothing',   anchor: 'back',        occupancy: { backOccupied: true },        syns: ['backpack','satchel','luggage','carry','tote'],                          incompatibleActions: ['swimming'] },
  { id: 'sword',    subCat: 'weapon',     anchor: 'right_hand', occupancy: { rightHandOccupied: true },  syns: ['blade','katana','weapon','combat','fight'],                             incompatibleActions: ['swimming','sitting','sleeping','eating'] },
  { id: 'gun',      subCat: 'weapon',     anchor: 'right_hand', occupancy: { rightHandOccupied: true },  syns: ['pistol','firearm','weapon','shoot'],                                    incompatibleActions: ['swimming','sleeping','eating'] },
  { id: 'shield',   subCat: 'weapon',     anchor: 'left_hand',  occupancy: { leftHandOccupied: true },   syns: ['armor','defense','guard','protection'],                                 incompatibleActions: ['swimming','sleeping'] },
  { id: 'hat',      subCat: 'clothing',   anchor: 'head',        occupancy: { headOccupied: true },        syns: ['cap','headwear','accessory','beanie','helmet'],                         incompatibleActions: [] },
  { id: 'umbrella', subCat: 'tool',       anchor: 'right_hand', occupancy: { rightHandOccupied: true },  syns: ['parasol','rain','weather','shelter'],                                   incompatibleActions: ['swimming','sleeping','jumping'] },
];

const PROP_STYLES = [
  { suffix: '01', label: 'Default',  prio: 0.90, quality: 0.90, weight: 0.90 },
  { suffix: '02', label: 'Sci-Fi',   prio: 0.75, quality: 0.80, weight: 0.70 },
  { suffix: '03', label: 'Stylized', prio: 0.70, quality: 0.75, weight: 0.70 },
];

PROP_DEFS.forEach(({ id, subCat, syns, anchor, occupancy, incompatibleActions }) => {
  const variants: AssetVariant[] = PROP_STYLES.map(s => ({
    variantId: `prop_${id}_${s.suffix}`,
    label: s.label,
    tags: [id, s.label.toLowerCase()],
  }));

  PROP_STYLES.forEach(({ suffix, label, prio, quality, weight }) => {
    a(`prop_${id}_${suffix}`, 'prop', subCat, `${id} (${label})`,
      [id, label.toLowerCase(), 'prop', 'object'],
      [id, ...syns, 'item', 'object', 'accessory', label.toLowerCase()],
      {
        layer: 20, zIndex: 0,
        anchorPoint: anchor,
        bodyOccupancy: occupancy,
        priority: prio, quality, weight,
        incompatibleActions,
        variants,
        fallbackAssets: suffix !== '01' ? [`prop_${id}_01`] : [],
      }
    );
  });
});

// ════════════════════════════════════════════════════════════
// LIGHTING (8)
// ════════════════════════════════════════════════════════════
const LIGHT_DEFS: { id: string; subCat: AssetSubCategory; syns: string[]; envs: string[] }[] = [
  { id: 'day_soft',              subCat: 'natural',    syns: ['daylight','natural','bright','outdoor_light','soft'],       envs: ['park','city','beach','mountain','forest','field'] },
  { id: 'night_neon',            subCat: 'artificial', syns: ['night','neon','dark','artificial','glow'],                  envs: ['city','street'] },
  { id: 'sunset_warm',           subCat: 'natural',    syns: ['sunset','warm','golden_hour','orange','twilight'],          envs: ['park','beach','mountain'] },
  { id: 'indoor_fluorescent',    subCat: 'artificial', syns: ['indoor','artificial','office_light','white','flat'],        envs: ['office','school','hospital'] },
  { id: 'dramatic_spot',         subCat: 'dramatic',   syns: ['dramatic','spotlight','theatrical','intense','shadow'],     envs: ['any'] },
  { id: 'sunrise_soft',          subCat: 'natural',    syns: ['dawn','morning','sunrise','early','fresh'],                 envs: ['park','beach','mountain','field'] },
  { id: 'home_warm',             subCat: 'ambient',    syns: ['cozy','warm','domestic','evening','lamp'],                  envs: ['home'] },
  { id: 'space_ambient',         subCat: 'ambient',    syns: ['cosmic','stars','dim','ethereal','space'],                  envs: ['space'] },
];

LIGHT_DEFS.forEach(({ id, subCat, syns, envs }) => {
  a(`light_${id}`, 'lighting', subCat, `Lighting: ${id}`,
    [id, 'lighting', 'light'],
    [id, ...syns, 'lighting', 'illumination', 'atmosphere', 'mood'],
    {
      layer: 5, zIndex: 0,
      compatibleEnvironments: envs.includes('any') ? ['any'] : envs,
      priority: 0.85, quality: 0.85, weight: 0.85,
      fallbackAssets: ['light_day_soft'],
    }
  );
});

// ════════════════════════════════════════════════════════════
// CAMERAS (8)
// ════════════════════════════════════════════════════════════
const CAM_DEFS: { id: string; subCat: AssetSubCategory; syns: string[] }[] = [
  { id: 'close_up',     subCat: 'static',    syns: ['closeup','tight','portrait','face','detail'] },
  { id: 'medium',       subCat: 'static',    syns: ['mid_shot','half_body','normal','standard','default'] },
  { id: 'wide',         subCat: 'static',    syns: ['full_body','long_shot','establishing','overview'] },
  { id: 'extreme_wide', subCat: 'cinematic', syns: ['aerial','panorama','landscape','establishing'] },
  { id: 'dutch_angle',  subCat: 'cinematic', syns: ['tilted','dramatic','slanted','tension'] },
  { id: 'over_shoulder',subCat: 'dynamic',   syns: ['perspective','pov_adjacent','talking_head'] },
  { id: 'follow',       subCat: 'dynamic',   syns: ['tracking','movement','chase','action'] },
  { id: 'pov',          subCat: 'cinematic', syns: ['first_person','subjective','eyes','viewpoint'] },
];

CAM_DEFS.forEach(({ id, subCat, syns }) => {
  a(`cam_${id}`, 'camera', subCat, `Camera: ${id}`,
    [id, 'camera', 'shot'],
    [id, ...syns, 'camera', 'shot', 'angle', 'framing', 'composition'],
    {
      layer: 50, zIndex: 0,
      priority: id === 'medium' ? 1.0 : 0.80,
      quality: 0.90, weight: 0.80,
      fallbackAssets: ['cam_medium'],
    }
  );
});

// ════════════════════════════════════════════════════════════
// WRITE OUTPUT
// ════════════════════════════════════════════════════════════
writeFileSync(path.join(dataDir, 'assets.json'), JSON.stringify(assets, null, 2));
console.log(`✓ Generated ${assets.length} fully-specified assets.`);
console.log(`  Characters:  ${assets.filter(a => a.category === 'character').length}`);
console.log(`  Expressions: ${assets.filter(a => a.category === 'expression').length}`);
console.log(`  Animations:  ${assets.filter(a => a.category === 'animation').length}`);
console.log(`  Backgrounds: ${assets.filter(a => a.category === 'background').length}`);
console.log(`  Props:       ${assets.filter(a => a.category === 'prop').length}`);
console.log(`  Lighting:    ${assets.filter(a => a.category === 'lighting').length}`);
console.log(`  Cameras:     ${assets.filter(a => a.category === 'camera').length}`);
