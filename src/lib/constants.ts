import type { Scale, DetailLevel, LayerDefinition } from '@/types'

// ─── Timezone ────────────────────────────────────────────────────────────────
export const TIMEZONE = 'Africa/Lusaka'   // UTC+2 CAT
export const TIMEZONE_ABBR = 'CAT'

// ─── Time constants (ms) ─────────────────────────────────────────────────────
export const MS = {
  second:  1_000,
  minute:  60_000,
  hour:    3_600_000,
  day:     86_400_000,
  week:    604_800_000,
  month:   30 * 86_400_000,
  year:    365.25 * 86_400_000,
} as const

// ─── Reference viewport width for pxPerMs calculation ───────────────────────
const REF_WIDTH = 2_400

// ─── Scale definitions (expanded for infinite zoom) ──────────────────────────
export const SCALES: Scale[] = [
  { name: 'Century',  pxPerMs: REF_WIDTH / (MS.year * 100),  label: 'Century'  },
  { name: '50 Years', pxPerMs: REF_WIDTH / (MS.year * 50),   label: '50 Years' },
  { name: 'Decade',   pxPerMs: REF_WIDTH / (MS.year * 10),   label: 'Decade'   },
  { name: '5 Years',  pxPerMs: REF_WIDTH / (MS.year * 5),    label: '5 Years'  },
  { name: '2 Years',  pxPerMs: REF_WIDTH / (MS.year * 2),    label: '2 Years'  },
  { name: 'Year',     pxPerMs: REF_WIDTH / MS.year,           label: 'Year'     },
  { name: 'Quarter',  pxPerMs: REF_WIDTH / (MS.day * 91),    label: 'Quarter'  },
  { name: 'Month',    pxPerMs: REF_WIDTH / (MS.day * 30),    label: 'Month'    },
  { name: 'Week',     pxPerMs: REF_WIDTH / (MS.day * 7),     label: 'Week'     },
  { name: 'Day',      pxPerMs: REF_WIDTH / MS.day,           label: 'Day'      },
  { name: '12 Hours', pxPerMs: REF_WIDTH / (MS.hour * 12),   label: '12 Hours' },
  { name: 'Hours',    pxPerMs: REF_WIDTH / (MS.hour * 6),    label: 'Hours'    },
  { name: 'Minutes',  pxPerMs: REF_WIDTH / (MS.minute * 30), label: 'Minutes'  },
]

export const MIN_SCALE_IDX = 0
export const MAX_SCALE_IDX = SCALES.length - 1
export const DEFAULT_SCALE_IDX = 6   // Quarter view

// ─── Detail levels for adaptive rendering ────────────────────────────────────
export const DETAIL_LEVELS: DetailLevel[] = [
  { scaleRange: [0, 2], gridDensity: 0.05, labelFrequency: 8, labelSize: 32, showSubdivisions: false, majorWeight: 1.0, minorWeight: 0.15 },
  { scaleRange: [3, 5], gridDensity: 0.15, labelFrequency: 4, labelSize: 22, showSubdivisions: true,  majorWeight: 0.7, minorWeight: 0.2 },
  { scaleRange: [6, 8], gridDensity: 0.35, labelFrequency: 2, labelSize: 15, showSubdivisions: true,  majorWeight: 0.5, minorWeight: 0.25 },
  { scaleRange: [9, 12], gridDensity: 0.6, labelFrequency: 1, labelSize: 11, showSubdivisions: true,  majorWeight: 0.4, minorWeight: 0.3 },
]

// ─── Color System (Temporal Navigation Palette) ──────────────────────────────
export const COLORS = {
  // Primary temporal colors
  nowLine:       '#00e5ff',
  nowGlow:       'rgba(0,229,255,0.15)',
  nowPip:        '#00e5ff',
  accent:        '#6b8cff',
  
  // Background zones - Past (darker, compressed)
  bgPast:        '#020206',
  bgPastEdge:    '#050510',
  bgPresent:     '#0a0a1a',
  bgFuture:      '#080818',
  bgFutureEdge:  '#060612',
  
  // Grid lines - Past (subtle, faded)
  gridPastMajor:    (alpha: number) => `rgba(100,100,140,${alpha * 0.12})`,
  gridPastMinor:    (alpha: number) => `rgba(80,80,120,${alpha * 0.06})`,
  // Grid lines - Future (brighter, more visible)
  gridFutureMajor:  (alpha: number) => `rgba(140,140,200,${alpha * 0.22})`,
  gridFutureMinor:  (alpha: number) => `rgba(120,120,180,${alpha * 0.1})`,
  // Grid lines - Present zone
  gridPresentMajor: (alpha: number) => `rgba(0,229,255,${alpha * 0.15})`,
  gridPresentMinor: (alpha: number) => `rgba(0,229,255,${alpha * 0.05})`,
  
  // Labels - Past (dim, distant)
  labelPastMajor:   'rgba(140,140,180,0.25)',
  labelPastMinor:   'rgba(100,100,140,0.12)',
  // Labels - Future (bright, inviting)
  labelFutureMajor: 'rgba(180,180,240,0.55)',
  labelFutureMinor: 'rgba(150,150,220,0.3)',
  // Labels - Present (luminous)
  labelNow:         'rgba(0,229,255,0.95)',
  labelPresent:     'rgba(180,220,255,0.6)',
  
  // Year labels
  yearPast:      'rgba(160,160,200,0.18)',
  yearFuture:    'rgba(180,180,240,0.5)',
  yearNow:       'rgba(0,229,255,0.95)',
  
  // UI elements
  uiBorder:      'rgba(255,255,255,0.06)',
  uiSurface:     'rgba(15,15,30,0.85)',
  uiHover:       'rgba(107,140,255,0.15)',
  
  // Layer colors for events
  layerPersonal:    '#6b8cff',
  layerProfessional:'#00e5ff',
  layerSocial:      '#ff6b9d',
  layerHealth:      '#00ffc8',
  layerLearning:    '#ff8c00',
  layerCreative:    '#8c6bff',
} as const

// ─── Temporal gradient stops ─────────────────────────────────────────────────
export const TEMPORAL_GRADIENT = {
  pastStart:     '#020206',
  pastMid:       '#050510',
  presentZone:   '#0a0a1a',
  futureMid:     '#080818',
  futureEnd:     '#060612',
  nowGlowCenter: 'rgba(0,229,255,0.08)',
  nowGlowEdge:   'rgba(0,0,0,0)',
} as const

// ─── Month & day name tables ──────────────────────────────────────────────────
export const MONTH_NAMES  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const
export const MONTH_NAMES_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'] as const
export const WEEKDAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const
export const WEEKDAY_NAMES_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] as const

// ─── Layer definitions ───────────────────────────────────────────────────────
export const LAYERS: LayerDefinition[] = [
  { id: 'personal',    name: 'Personal',    color: COLORS.layerPersonal,    enabled: true },
  { id: 'professional', name: 'Professional', color: COLORS.layerProfessional, enabled: true },
  { id: 'social',      name: 'Social',      color: COLORS.layerSocial,      enabled: true },
  { id: 'health',      name: 'Health',      color: COLORS.layerHealth,      enabled: true },
  { id: 'learning',    name: 'Learning',    color: COLORS.layerLearning,    enabled: true },
  { id: 'creative',    name: 'Creative',    color: COLORS.layerCreative,    enabled: true },
] as const

// ─── Animation timing ────────────────────────────────────────────────────────
export const ANIMATION = {
  zoomDuration:    400,
  panInertia:      800,
  fadeIn:          600,
  pulse:           2000,
  hoverTransition: 150,
  easeOut:         'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOut:       'cubic-bezier(0.42, 0, 0.58, 1)',
  smooth:          'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const

// ─── Keyboard shortcuts ──────────────────────────────────────────────────────
export const SHORTCUTS = {
  zoomIn:     ['+', '='],
  zoomOut:    ['-'],
  goToNow:    ['n', 'N'],
  search:     ['/', 'k'],
  panLeft:    ['ArrowLeft', 'h'],
  panRight:   ['ArrowRight', 'l'],
  help:       ['?'],
} as const