import { PoseItem } from '../types/pose';

// Real generated high-definition photographic assets
import fashionTrenchImg from '../assets/images/pose_fashion_trench_1793550926887.jpg';
import sittingCafeImg from '../assets/images/pose_sitting_cafe_1793550929272.jpg';
import travelSunsetImg from '../assets/images/pose_travel_sunset_1793550929459.jpg';
import mirrorSelfieImg from '../assets/images/pose_mirror_selfie_1793550929248.jpg';

// Helper to create clean vector silhouette reference data URIs for resilient offline poses
function createPoseSvg(type: string, accentColor = '#38bdf8'): string {
  let bodyShapes = '';
  switch (type) {
    case 'walking_solo':
      bodyShapes = `
        <circle cx="150" cy="70" r="22" stroke="${accentColor}" stroke-width="4" fill="none"/>
        <line x1="150" y1="92" x2="148" y2="200" stroke="${accentColor}" stroke-width="4"/>
        <line x1="148" y1="120" x2="110" y2="175" stroke="${accentColor}" stroke-width="4"/>
        <line x1="148" y1="120" x2="185" y2="165" stroke="${accentColor}" stroke-width="4"/>
        <line x1="148" y1="200" x2="115" y2="300" stroke="${accentColor}" stroke-width="4"/>
        <line x1="148" y1="200" x2="180" y2="295" stroke="${accentColor}" stroke-width="4"/>
        <!-- Coffee cup in hand -->
        <rect x="180" y="160" width="12" height="16" rx="2" fill="${accentColor}"/>
      `;
      break;
    case 'leaning_wall':
      bodyShapes = `
        <circle cx="160" cy="75" r="22" stroke="${accentColor}" stroke-width="4" fill="none"/>
        <line x1="160" y1="97" x2="145" y2="195" stroke="${accentColor}" stroke-width="4"/>
        <line x1="155" y1="125" x2="120" y2="155" stroke="${accentColor}" stroke-width="4"/>
        <line x1="120" y1="155" x2="125" y2="195" stroke="${accentColor}" stroke-width="4"/>
        <line x1="155" y1="125" x2="190" y2="165" stroke="${accentColor}" stroke-width="4"/>
        <line x1="145" y1="195" x2="135" y2="295" stroke="${accentColor}" stroke-width="4"/>
        <line x1="145" y1="195" x2="165" y2="260" stroke="${accentColor}" stroke-width="4"/>
        <line x1="165" y1="260" x2="140" y2="295" stroke="${accentColor}" stroke-width="4"/>
        <line x1="85" y1="50" x2="85" y2="340" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="4 4"/>
      `;
      break;
    case 'couple_stroll':
      bodyShapes = `
        <!-- Person 1 -->
        <circle cx="125" cy="75" r="18" stroke="${accentColor}" stroke-width="3.5" fill="none"/>
        <line x1="125" y1="93" x2="125" y2="190" stroke="${accentColor}" stroke-width="3.5"/>
        <line x1="125" y1="115" x2="100" y2="160" stroke="${accentColor}" stroke-width="3.5"/>
        <line x1="125" y1="115" x2="145" y2="155" stroke="${accentColor}" stroke-width="3.5"/>
        <line x1="125" y1="190" x2="105" y2="290" stroke="${accentColor}" stroke-width="3.5"/>
        <line x1="125" y1="190" x2="135" y2="290" stroke="${accentColor}" stroke-width="3.5"/>
        <!-- Person 2 -->
        <circle cx="175" cy="85" r="17" stroke="#fb7185" stroke-width="3.5" fill="none"/>
        <line x1="175" y1="102" x2="175" y2="190" stroke="#fb7185" stroke-width="3.5"/>
        <line x1="175" y1="120" x2="155" y2="155" stroke="#fb7185" stroke-width="3.5"/>
        <line x1="175" y1="120" x2="195" y2="165" stroke="#fb7185" stroke-width="3.5"/>
        <line x1="175" y1="190" x2="165" y2="290" stroke="#fb7185" stroke-width="3.5"/>
        <line x1="175" y1="190" x2="190" y2="290" stroke="#fb7185" stroke-width="3.5"/>
        <!-- Holding hands -->
        <circle cx="150" cy="155" r="5" fill="#facc15"/>
      `;
      break;
    case 'couple_hug':
      bodyShapes = `
        <circle cx="138" cy="80" r="18" stroke="${accentColor}" stroke-width="3.5" fill="none"/>
        <circle cx="162" cy="86" r="17" stroke="#fb7185" stroke-width="3.5" fill="none"/>
        <path d="M 125,120 Q 150,110 175,120 L 170,195 Q 150,205 130,195 Z" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none"/>
        <path d="M 120,130 C 130,140 160,140 170,130" stroke="${accentColor}" stroke-width="3.5" fill="none"/>
        <line x1="135" y1="195" x2="130" y2="300" stroke="${accentColor}" stroke-width="3.5"/>
        <line x1="165" y1="195" x2="170" y2="300" stroke="#fb7185" stroke-width="3.5"/>
      `;
      break;
    case 'stairs_sitting':
      bodyShapes = `
        <path d="M 70,180 L 120,180 L 120,230 L 170,230 L 170,280 L 220,280 L 220,330" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
        <circle cx="140" cy="95" r="20" stroke="${accentColor}" stroke-width="4" fill="none"/>
        <line x1="140" y1="115" x2="140" y2="185" stroke="${accentColor}" stroke-width="4"/>
        <line x1="140" y1="185" x2="185" y2="185" stroke="${accentColor}" stroke-width="4"/>
        <line x1="185" y1="185" x2="185" y2="280" stroke="${accentColor}" stroke-width="4"/>
        <line x1="140" y1="140" x2="175" y2="175" stroke="${accentColor}" stroke-width="4"/>
        <line x1="175" y1="175" x2="165" y2="215" stroke="${accentColor}" stroke-width="4"/>
      `;
      break;
    case 'over_shoulder':
      bodyShapes = `
        <circle cx="150" cy="80" r="22" stroke="${accentColor}" stroke-width="4" fill="none"/>
        <line x1="150" y1="102" x2="148" y2="200" stroke="${accentColor}" stroke-width="4"/>
        <!-- Turned shoulders -->
        <path d="M 120,120 Q 150,115 175,135" stroke="${accentColor}" stroke-width="4" fill="none"/>
        <line x1="120" y1="120" x2="105" y2="190" stroke="${accentColor}" stroke-width="4"/>
        <line x1="175" y1="135" x2="185" y2="195" stroke="${accentColor}" stroke-width="4"/>
        <line x1="148" y1="200" x2="135" y2="300" stroke="${accentColor}" stroke-width="4"/>
        <line x1="148" y1="200" x2="165" y2="300" stroke="${accentColor}" stroke-width="4"/>
      `;
      break;
    default:
      bodyShapes = `
        <circle cx="150" cy="80" r="22" stroke="${accentColor}" stroke-width="4" fill="none"/>
        <line x1="150" y1="102" x2="150" y2="200" stroke="${accentColor}" stroke-width="4"/>
        <line x1="150" y1="130" x2="115" y2="175" stroke="${accentColor}" stroke-width="4"/>
        <line x1="150" y1="130" x2="185" y2="175" stroke="${accentColor}" stroke-width="4"/>
        <line x1="150" y1="200" x2="130" y2="300" stroke="${accentColor}" stroke-width="4"/>
        <line x1="150" y1="200" x2="170" y2="300" stroke="${accentColor}" stroke-width="4"/>
      `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
    <rect width="300" height="400" fill="#111827"/>
    <!-- Subtle grid guides -->
    <line x1="100" y1="0" x2="100" y2="400" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="0" y1="133" x2="300" y2="133" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <line x1="0" y1="266" x2="300" y2="266" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    ${bodyShapes}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_POSES: PoseItem[] = [
  {
    id: 'fashion_trench_classic',
    name: 'Editorial Trench Stroll',
    category: 'fashion',
    imageUrl: fashionTrenchImg,
    thumbnailUrl: fashionTrenchImg,
    aspectRatio: '3:4',
    difficulty: 'Editorial',
    description: 'Clean architectural full-body pose with tied waist coat, hand casually in pocket, and subtle head turn.',
    tips: [
      'Angle shoulders 15° away from camera',
      'Slip right hand into coat pocket, keep wrist relaxed',
      'Look slightly past the camera lens to create natural eye focus',
      'Keep one foot slightly forward to elongate posture'
    ]
  },
  {
    id: 'sitting_cafe_relaxed',
    name: 'Morning Cafe Table',
    category: 'sitting',
    imageUrl: sittingCafeImg,
    thumbnailUrl: sittingCafeImg,
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Natural seated coffee shop posture with crossed legs, warm cup hold, and candid gaze.',
    tips: [
      'Cross one leg over knee with ankle relaxed',
      'Rest forearm naturally on wooden table holding cup',
      'Tilt chin slightly upward toward incoming window light',
      'Drop your shoulders to avoid looking tense'
    ]
  },
  {
    id: 'travel_sunset_horizon',
    name: 'Golden Hour Lookout',
    category: 'travel',
    imageUrl: travelSunsetImg,
    thumbnailUrl: travelSunsetImg,
    aspectRatio: '3:4',
    difficulty: 'Moderate',
    description: 'Scenic outdoor viewpoint pose shielding eyes against the sunset with backpack silhouette.',
    tips: [
      'Position yourself at a 3/4 back-to-camera angle',
      'Raise arm gracefully to eyebrow level as if taking in the vista',
      'Shift 70% of body weight to your back foot for stability',
      'Let wind catch your hair naturally'
    ]
  },
  {
    id: 'mirror_aesthetic_arch',
    name: 'Arched Mirror Fit Check',
    category: 'mirror',
    imageUrl: mirrorSelfieImg,
    thumbnailUrl: mirrorSelfieImg,
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Effortless standing mirror selfie in casual knitwear holding phone at mid-chest level.',
    tips: [
      'Hold camera at sternum height, not eye level',
      'Tilt phone forward 5° to prevent perspective distortion',
      'Rest one hip slightly higher than the other',
      'Keep shoulders square with the mirror plane'
    ]
  },
  {
    id: 'solo_street_coffee',
    name: 'Urban Coffee Walk',
    category: 'solo',
    imageUrl: createPoseSvg('walking_solo', '#60a5fa'),
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Dynamic mid-stride street walk holding your morning coffee with relaxed arm swing.',
    tips: [
      'Take a natural forward stride, pausing with front foot planted',
      'Hold drink at waist level',
      'Look down toward your footsteps for an organic candid feel',
      'Keep spine tall and neck aligned'
    ]
  },
  {
    id: 'solo_wall_lean',
    name: 'Textured Wall Lean',
    category: 'solo',
    imageUrl: createPoseSvg('leaning_wall', '#34d399'),
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Casual back-to-wall lean with one foot propped up against the wall.',
    tips: [
      'Rest upper shoulder blades against wall surface',
      'Bend one knee and press sole flat against the wall 1 foot off ground',
      'Cross arms gently over chest or slip thumbs into pockets',
      'Camera at waist height for flattering proportions'
    ]
  },
  {
    id: 'couple_sunset_stroll',
    name: 'Hand in Hand Walk',
    category: 'couple',
    imageUrl: createPoseSvg('couple_stroll', '#f43f5e'),
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Walking side-by-side holding hands while smiling toward each other.',
    tips: [
      'Walk at a gentle slow pace together',
      'Look at each other and share a quiet laugh',
      'Clasp hands loosely between you',
      'Keep heads tilted slightly inward toward each other'
    ]
  },
  {
    id: 'couple_gentle_embrace',
    name: 'Warm Shoulder Embrace',
    category: 'couple',
    imageUrl: createPoseSvg('couple_hug', '#fb7185'),
    aspectRatio: '3:4',
    difficulty: 'Moderate',
    description: 'Intimate close-up embrace with one partner wrapped from behind or side.',
    tips: [
      'Taller partner rests chin softly near partner’s temple',
      'Wrap arms around torso or shoulders',
      'Close eyes gently for emotional depth or look toward distance',
      'Position camera slightly above eye level'
    ]
  },
  {
    id: 'sitting_marble_stairs',
    name: 'City Steps Relaxed',
    category: 'sitting',
    imageUrl: createPoseSvg('stairs_sitting', '#a78bfa'),
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Sitting comfortably across two steps with one elbow resting on raised knee.',
    tips: [
      'Sit on step 2, place one foot on step 1 and one on ground',
      'Rest elbow on higher knee, hand relaxing near jawline',
      'Lean body slightly forward toward camera',
      'Keep back straight from lower spine'
    ]
  },
  {
    id: 'fashion_over_shoulder',
    name: 'Over the Shoulder Glance',
    category: 'fashion',
    imageUrl: createPoseSvg('over_shoulder', '#e879f9'),
    aspectRatio: '3:4',
    difficulty: 'Editorial',
    description: 'Back facing camera, pivoting torso and neck around to look back directly into lens.',
    tips: [
      'Face away from camera initially',
      'Turn upper body 90° and look over dominant shoulder',
      'Drop the shoulder facing the camera slightly',
      'Part lips softly to relieve tension in jaw'
    ]
  },
  {
    id: 'travel_monument_candid',
    name: 'Architectural Gazing',
    category: 'travel',
    imageUrl: createPoseSvg('walking_solo', '#f59e0b'),
    aspectRatio: '3:4',
    difficulty: 'Moderate',
    description: 'Wide shot facing impressive architecture with body turned sideways in admiration.',
    tips: [
      'Leave ample headspace for the architecture or scenery',
      'Hold a map, camera, or sunglasses loosely',
      'Stand perpendicular to the camera line',
      'Keep chin elevated'
    ]
  },
  {
    id: 'mirror_sitting_floor',
    name: 'Floor Mirror Check',
    category: 'mirror',
    imageUrl: createPoseSvg('stairs_sitting', '#38bdf8'),
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Seated crossed legs directly in front of a full-length floor mirror.',
    tips: [
      'Sit cross-legged with back erect',
      'Hold phone angled slightly downward',
      'Rest free hand on ankle or floor',
      'Keep background clean and uncluttered'
    ]
  },
  {
    id: 'solo_pocket_hands',
    name: 'Tailored Stance',
    category: 'solo',
    imageUrl: createPoseSvg('leaning_wall', '#10b981'),
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Both thumbs hooked into front pockets, elbows gently flared out, balanced stance.',
    tips: [
      'Feet shoulder-width apart, weight evenly distributed',
      'Hook only thumbs in pockets leaving fingers relaxed',
      'Look straight ahead with confident calm expression',
      'Level camera directly with chest'
    ]
  },
  {
    id: 'fashion_power_blazer',
    name: 'Power Blazer Silhouette',
    category: 'fashion',
    imageUrl: createPoseSvg('over_shoulder', '#c084fc'),
    aspectRatio: '3:4',
    difficulty: 'Editorial',
    description: 'High-fashion editorial stance with hands resting on hips and head cocked.',
    tips: [
      'Place knuckles gently on hip bones',
      'Cock head 10° to the side',
      'Arch back slightly and engage core',
      'Direct, piercing gaze into the center lens'
    ]
  },
  {
    id: 'couple_forehead_touch',
    name: 'Forehead Kiss & Laugh',
    category: 'couple',
    imageUrl: createPoseSvg('couple_hug', '#f472b6'),
    aspectRatio: '3:4',
    difficulty: 'Moderate',
    description: 'Sweet forehead-to-forehead touch with gentle laughter and closed eyes.',
    tips: [
      'Bring foreheads together with noses slightly offset',
      'Whisper an inside joke to evoke a genuine smile',
      'Hands resting naturally on partner’s waist or neck',
      'Shoot at eye level'
    ]
  },
  {
    id: 'sitting_curb_candid',
    name: 'Curb Drop Candid',
    category: 'sitting',
    imageUrl: createPoseSvg('stairs_sitting', '#fdba74'),
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Street-style seating on a clean curb with knees bent and elbows on knees.',
    tips: [
      'Sit on low ledge or curb with knees drawn up',
      'Rest elbows on kneecaps, hands clasped loosely',
      'Tilt head forward slightly and look up at camera',
      'Great with wide or low angle camera height'
    ]
  },
  {
    id: 'travel_bridge_crossing',
    name: 'Bridge Crossing View',
    category: 'travel',
    imageUrl: createPoseSvg('walking_solo', '#22d3ee'),
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Midway crossing a scenic pedestrian bridge or pathway with scenic backdrop.',
    tips: [
      'Position body on the rule-of-thirds vertical line',
      'Look toward the distant scenery rather than the phone',
      'One hand trailing along the railing',
      'Allow background lines of perspective to lead to you'
    ]
  },
  {
    id: 'mirror_elevator_selfie',
    name: 'Elevator Chrome Fit',
    category: 'mirror',
    imageUrl: createPoseSvg('leaning_wall', '#94a3b8'),
    aspectRatio: '3:4',
    difficulty: 'Easy',
    description: 'Sleek mirrored elevator selfie capturing modern metallic reflections.',
    tips: [
      'Lean gently against side handrail',
      'Hold phone at 45° angle',
      'Check ceiling lighting highlights outfit textures',
      'Square frame with elevator walls'
    ]
  }
];
