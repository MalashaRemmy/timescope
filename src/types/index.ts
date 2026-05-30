// ─── Scale Definition ────────────────────────────────────────────────────────
export type ScaleName =
  | 'Century'
  | '50 Years'
  | 'Decade'
  | '5 Years'
  | '2 Years'
  | 'Year'
  | 'Quarter'
  | 'Month'
  | 'Week'
  | 'Day'
  | '12 Hours'
  | 'Hours'
  | 'Minutes'

export interface Scale {
  name: ScaleName
  /** pixels per millisecond at this zoom level (viewport = 2400px wide reference) */
  pxPerMs: number
  /** label shown in the HUD badge */
  label: string
}

// ─── Viewport State ──────────────────────────────────────────────────────────
export interface ViewportState {
  /** millisecond timestamp at pixel 0 (left edge) */
  offsetMs: number
  /** current scale index into SCALES array */
  scaleIdx: number
  /** pixels per millisecond (derived from scale) */
  pxPerMs: number
  /** viewport width in CSS pixels */
  width: number
  /** viewport height in CSS pixels */
  height: number
}

// ─── Tick Interval ───────────────────────────────────────────────────────────
export interface TickInterval {
  /** duration in milliseconds */
  ms: number
  /** stroke weight 0..1 */
  weight: number
  showLabel: boolean
  labelFn: (date: Date) => string
}

// ─── Detail Level for adaptive rendering ─────────────────────────────────────
export interface DetailLevel {
  /** Scale indices this applies to */
  scaleRange: [number, number]
  /** Grid lines per screen width factor */
  gridDensity: number
  /** How often to show labels */
  labelFrequency: number
  /** Font size for labels */
  labelSize: number
  /** Show minor grid lines */
  showSubdivisions: boolean
  /** Major grid line weight */
  majorWeight: number
  /** Minor grid line weight */
  minorWeight: number
}

// ─── Temporal Zone ───────────────────────────────────────────────────────────
export type TemporalZone = 'past' | 'present' | 'future'

// ─── Drag State ──────────────────────────────────────────────────────────────
export interface DragState {
  active: boolean
  lastX: number
  velocity: number
  timestamp: number
}

// ─── Pinch State ─────────────────────────────────────────────────────────────
export interface PinchState {
  active: boolean
  lastDist: number
  center: { x: number; y: number }
}

// ─── Layer Definition ────────────────────────────────────────────────────────
export interface LayerDefinition {
  id: string
  name: string
  color: string
  enabled: boolean
}

// ─── Temporal Event ──────────────────────────────────────────────────────────
export interface TemporalEvent {
  id: string
  title: string
  startMs: number
  endMs: number
  layer: string
  color?: string
  description?: string
  location?: string
  metadata?: Record<string, unknown>
}

// ─── Temporal Bookmark ───────────────────────────────────────────────────────
export interface TemporalBookmark {
  id: string
  name: string
  timestamp: number
  scale: number
  color?: string
}

// ─── User Preferences ────────────────────────────────────────────────────────
export interface UserPreferences {
  timezone: string
  theme: 'dark' | 'light' | 'auto'
  defaultScale: number
  layers: Record<string, boolean>
  showPast: boolean
  showFuture: boolean
}

// ─── Navigation State ────────────────────────────────────────────────────────
export interface NavigationState {
  /** Current temporal position (center of viewport) */
  position: number
  /** Current scale/zoom level */
  scale: number
  /** Navigation velocity for inertia */
  velocity: number
  /** Is user currently navigating */
  isNavigating: boolean
}

// ─── Render Context ──────────────────────────────────────────────────────────
export interface RenderContext {
  /** Canvas width in pixels */
  width: number
  /** Canvas height in pixels */
  height: number
  /** Milliseconds at left edge */
  offsetMs: number
  /** Pixels per millisecond */
  pxPerMs: number
  /** Current scale index */
  scaleIdx: number
  /** Current time in milliseconds */
  nowMs: number
  /** Device pixel ratio */
  dpr: number
}