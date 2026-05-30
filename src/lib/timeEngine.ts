import { TIMEZONE, SCALES, MS, DETAIL_LEVELS } from './constants'
import type { TickInterval, DetailLevel } from '@/types'

// ─── Lusaka time helpers ──────────────────────────────────────────────────────
export function nowInLusaka(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
}

export function nowMs(): number {
  return nowInLusaka().getTime()
}

// ─── Coordinate conversions ───────────────────────────────────────────────────
/** Convert a ms timestamp to a canvas X pixel given the current viewport */
export function msToX(ms: number, offsetMs: number, pxPerMs: number): number {
  return (ms - offsetMs) * pxPerMs
}

/** Convert a canvas X pixel to a ms timestamp */
export function xToMs(x: number, offsetMs: number, pxPerMs: number): number {
  return x / pxPerMs + offsetMs
}

/** Given a pivot point (ms) and old/new pxPerMs, return the new offsetMs
 *  so the pivot stays at the same screen pixel. */
export function zoomAroundPivot(
  pivotMs:    number,
  pivotX:     number,
  newPxPerMs: number,
): number {
  return pivotMs - pivotX / newPxPerMs
}

// ─── Center viewport on a timestamp ──────────────────────────────────────────
export function centerOffsetMs(
  targetMs: number,
  viewportWidth: number,
  pxPerMs: number,
): number {
  return targetMs - viewportWidth / 2 / pxPerMs
}

// ─── Get detail level for a scale index ──────────────────────────────────────
export function getDetailLevel(scaleIdx: number): DetailLevel | null {
  for (const level of DETAIL_LEVELS) {
    if (scaleIdx >= level.scaleRange[0] && scaleIdx <= level.scaleRange[1]) {
      return level
    }
  }
  return null
}

// ─── Tick intervals per scale index ──────────────────────────────────────────
export function getTickIntervals(scaleIdx: number): TickInterval[] {
  const idx = scaleIdx
  
  // Century view (0-1)
  if (idx <= 1) return [
    { ms: MS.year * 100, weight: 1.2, showLabel: false, labelFn: () => '' },
    { ms: MS.year * 25,  weight: 0.5, showLabel: false, labelFn: () => '' },
    { ms: MS.year * 10,  weight: 0.2, showLabel: false, labelFn: () => '' },
  ]
  
  // Decade view (2)
  if (idx === 2) return [
    { ms: MS.year * 10,  weight: 1.0, showLabel: false, labelFn: () => '' },
    { ms: MS.year * 2,   weight: 0.4, showLabel: false, labelFn: () => '' },
    { ms: MS.year,       weight: 0.15, showLabel: false, labelFn: () => '' },
  ]
  
  // Multi-year view (3-4)
  if (idx <= 4) return [
    { ms: MS.year,       weight: 0.8, showLabel: false, labelFn: () => '' },
    { ms: MS.month * 3,  weight: 0.3, showLabel: false, labelFn: () => '' },
  ]
  
  // Year view (5)
  if (idx === 5) return [
    { ms: MS.year,       weight: 0.7, showLabel: false, labelFn: () => '' },
    { ms: MS.month * 3,  weight: 0.4, showLabel: false, labelFn: () => '' },
    { ms: MS.month,      weight: 0.15, showLabel: false, labelFn: () => '' },
  ]
  
  // Quarter view (6)
  if (idx === 6) return [
    { ms: MS.month * 3,  weight: 0.8, showLabel: false, labelFn: () => '' },
    { ms: MS.month,      weight: 0.4, showLabel: false, labelFn: () => '' },
    { ms: MS.week,       weight: 0.15, showLabel: false, labelFn: () => '' },
  ]
  
  // Month view (7)
  if (idx === 7) return [
    { ms: MS.month,      weight: 0.8, showLabel: false, labelFn: () => '' },
    { ms: MS.week,       weight: 0.4, showLabel: false, labelFn: () => '' },
    { ms: MS.day,        weight: 0.15, showLabel: false, labelFn: () => '' },
  ]
  
  // Week view (8)
  if (idx === 8) return [
    { ms: MS.week,       weight: 0.8, showLabel: false, labelFn: () => '' },
    { ms: MS.day,        weight: 0.4, showLabel: false, labelFn: () => '' },
  ]
  
  // Day view (9)
  if (idx === 9) return [
    { ms: MS.day,        weight: 0.8, showLabel: false, labelFn: () => '' },
    { ms: MS.hour * 6,   weight: 0.4, showLabel: false, labelFn: () => '' },
    { ms: MS.hour,       weight: 0.2, showLabel: false, labelFn: () => '' },
  ]
  
  // 12-hour view (10)
  if (idx === 10) return [
    { ms: MS.hour * 6,   weight: 0.7, showLabel: false, labelFn: () => '' },
    { ms: MS.hour,       weight: 0.4, showLabel: false, labelFn: () => '' },
    { ms: MS.minute * 30, weight: 0.2, showLabel: false, labelFn: () => '' },
  ]
  
  // Hour view (11)
  if (idx === 11) return [
    { ms: MS.hour,       weight: 0.8, showLabel: false, labelFn: () => '' },
    { ms: MS.minute * 30, weight: 0.4, showLabel: false, labelFn: () => '' },
    { ms: MS.minute * 10, weight: 0.15, showLabel: false, labelFn: () => '' },
  ]
  
  // Minutes view (12)
  return [
    { ms: MS.minute * 30, weight: 0.7, showLabel: false, labelFn: () => '' },
    { ms: MS.minute * 10, weight: 0.4, showLabel: false, labelFn: () => '' },
    { ms: MS.minute,      weight: 0.2, showLabel: false, labelFn: () => '' },
  ]
}

// ─── Visible ms range ─────────────────────────────────────────────────────────
export function visibleRange(
  offsetMs: number,
  width: number,
  pxPerMs: number,
): [number, number] {
  return [offsetMs, offsetMs + width / pxPerMs]
}

// ─── Snap ms to floor of interval ────────────────────────────────────────────
export function floorToInterval(ms: number, intervalMs: number): number {
  return Math.floor(ms / intervalMs) * intervalMs
}

// ─── Format helpers ───────────────────────────────────────────────────────────
export function formatHourLabel(date: Date): string {
  const h = date.getHours()
  const m = date.getMinutes()
  
  if (m === 0) {
    if (h === 0)  return '12am'
    if (h < 12)   return `${h}am`
    if (h === 12) return '12pm'
    return `${h - 12}pm`
  }
  
  // Show time with minutes
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')}${ampm}`
}

export function formatClock(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function formatClockWithMs(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

// ─── Scale accessor ───────────────────────────────────────────────────────────
export function getScale(idx: number) {
  return SCALES[Math.max(0, Math.min(SCALES.length - 1, idx))]
}

// ─── Temporal distance helpers ────────────────────────────────────────────────
export function getTimeAgoString(timestamp: number, now: number): string {
  const diff = now - timestamp
  const absDiff = Math.abs(diff)
  const isFuture = diff < 0
  
  if (absDiff < MS.minute) return 'just now'
  if (absDiff < MS.hour) {
    const mins = Math.floor(absDiff / MS.minute)
    return `${mins} minute${mins !== 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`
  }
  if (absDiff < MS.day) {
    const hours = Math.floor(absDiff / MS.hour)
    return `${hours} hour${hours !== 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`
  }
  if (absDiff < MS.week) {
    const days = Math.floor(absDiff / MS.day)
    return `${days} day${days !== 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`
  }
  if (absDiff < MS.month) {
    const weeks = Math.floor(absDiff / MS.week)
    return `${weeks} week${weeks !== 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`
  }
  if (absDiff < MS.year) {
    const months = Math.floor(absDiff / MS.month)
    return `${months} month${months !== 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`
  }
  const years = Math.floor(absDiff / MS.year)
  return `${years} year${years !== 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`
}

// ─── Date formatting helpers ──────────────────────────────────────────────────
export function formatDateLong(timestamp: number): string {
  const d = new Date(timestamp)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return d.toLocaleDateString('en-US', options)
}

export function formatDateShort(timestamp: number): string {
  const d = new Date(timestamp)
  return `${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ─── Temporal navigation helpers ──────────────────────────────────────────────
export function getNextInterval(timestamp: number, interval: number): number {
  return Math.ceil(timestamp / interval) * interval
}

export function getPrevInterval(timestamp: number, interval: number): number {
  return Math.floor(timestamp / interval) * interval
}

// ─── Smooth zoom interpolation ───────────────────────────────────────────────
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function lerpClamp(a: number, b: number, t: number): number {
  return Math.max(Math.min(lerp(a, b, t), Math.max(a, b)), Math.min(a, b))
}