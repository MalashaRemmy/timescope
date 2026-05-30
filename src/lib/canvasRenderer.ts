import {
  msToX, xToMs, getTickIntervals, visibleRange,
  floorToInterval, formatHourLabel, getDetailLevel,
} from './timeEngine'
import {
  COLORS, MONTH_NAMES, WEEKDAY_NAMES, MS, TEMPORAL_GRADIENT,
} from './constants'
import type { DetailLevel } from '@/types'

// ─── Font strings ─────────────────────────────────────────────────────────────
const F_DISPLAY = "'Syne', 'Inter', sans-serif"
const F_MONO    = "'JetBrains Mono', 'Fira Code', monospace"
const F_UI      = "'Inter', -apple-system, sans-serif"

// ─── Main render function ─────────────────────────────────────────────────────
export function renderTimeline(
  ctx:      CanvasRenderingContext2D,
  W:        number,
  H:        number,
  offsetMs: number,
  pxPerMs:  number,
  nowMs:    number,
  scaleIdx: number,
): void {
  // Validate dimensions
  if (W <= 0 || H <= 0) return
  
  // Clear the entire canvas
  ctx.clearRect(0, 0, W, H)

  // Get detail level for this scale
  const detail = getDetailLevel(scaleIdx)

  // Calculate visible range and now position
  const nowX = msToX(nowMs, offsetMs, pxPerMs)
  const [leftMs, rightMs] = visibleRange(offsetMs, W, pxPerMs)

  // Draw all layers
  drawBackgroundZones(ctx, W, H, nowX)
  drawDepthEffects(ctx, W, H, nowX)
  drawGridLines(ctx, W, H, leftMs, rightMs, offsetMs, pxPerMs, nowMs, scaleIdx, detail)
  drawScaleLabels(ctx, W, H, leftMs, rightMs, offsetMs, pxPerMs, nowMs, scaleIdx, detail)
  drawNowLine(ctx, W, H, nowX)
  drawNowPulse(ctx, W, H, nowX)
}

// ─── Background zones ─────────────────────────────────────────────────────────
// Creates the temporal gradient: dark past → luminous present → bright future
function drawBackgroundZones(
  ctx:  CanvasRenderingContext2D,
  W:    number,
  H:    number,
  nowX: number,
): void {
  // Past zone (darker, compressed feeling)
  if (nowX > 0) {
    const pastWidth = Math.min(nowX, W)
    const g = ctx.createLinearGradient(0, 0, pastWidth, 0)
    g.addColorStop(0, TEMPORAL_GRADIENT.pastStart)
    g.addColorStop(0.5, TEMPORAL_GRADIENT.pastMid)
    g.addColorStop(1, TEMPORAL_GRADIENT.presentZone)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, pastWidth, H)
  }
  
  // Future zone (brighter, expansive feeling)
  if (nowX < W) {
    const futureStart = Math.max(nowX, 0)
    const futureWidth = W - futureStart
    const g = ctx.createLinearGradient(futureStart, 0, W, 0)
    g.addColorStop(0, TEMPORAL_GRADIENT.presentZone)
    g.addColorStop(0.5, TEMPORAL_GRADIENT.futureMid)
    g.addColorStop(1, TEMPORAL_GRADIENT.futureEnd)
    ctx.fillStyle = g
    ctx.fillRect(futureStart, 0, futureWidth, H)
  }
}

// ─── Depth/atmospheric effects ────────────────────────────────────────────────
// Adds subtle depth cues around the now line
function drawDepthEffects(
  ctx:  CanvasRenderingContext2D,
  W:    number,
  H:    number,
  nowX: number,
): void {
  // Subtle vignette at edges
  const vignetteWidth = Math.min(200, W * 0.15)
  
  // Left edge vignette
  if (vignetteWidth > 0) {
    const leftVig = ctx.createLinearGradient(0, 0, vignetteWidth, 0)
    leftVig.addColorStop(0, 'rgba(0,0,0,0.3)')
    leftVig.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = leftVig
    ctx.fillRect(0, 0, vignetteWidth, H)
  }
  
  // Right edge vignette
  if (vignetteWidth > 0 && W > vignetteWidth) {
    const rightVig = ctx.createLinearGradient(W - vignetteWidth, 0, W, 0)
    rightVig.addColorStop(0, 'rgba(0,0,0,0)')
    rightVig.addColorStop(1, 'rgba(0,0,0,0.3)')
    ctx.fillStyle = rightVig
    ctx.fillRect(W - vignetteWidth, 0, vignetteWidth, H)
  }

  // Now zone glow (wider, softer than the line itself)
  if (nowX > -300 && nowX < W + 300) {
    const glowWidth = Math.min(200, W * 0.1)
    const glow = ctx.createRadialGradient(nowX, H * 0.5, 0, nowX, H * 0.5, glowWidth)
    glow.addColorStop(0, TEMPORAL_GRADIENT.nowGlowCenter)
    glow.addColorStop(0.5, 'rgba(0,229,255,0.02)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(Math.max(0, nowX - glowWidth), 0, Math.min(glowWidth * 2, W), H)
  }
}

// ─── Grid lines ───────────────────────────────────────────────────────────────
function drawGridLines(
  ctx:      CanvasRenderingContext2D,
  W:        number,
  H:        number,
  leftMs:   number,
  rightMs:  number,
  offsetMs: number,
  pxPerMs:  number,
  nowMs:    number,
  scaleIdx: number,
  detail:   DetailLevel | null,
): void {
  const intervals = getTickIntervals(scaleIdx)

  for (const { ms: intervalMs, weight } of intervals) {
    const startMs = floorToInterval(leftMs, intervalMs)
    const isMajor = weight >= 0.4
    
    for (let t = startMs; t <= rightMs + intervalMs; t += intervalMs) {
      const x = msToX(t, offsetMs, pxPerMs)
      if (x < -2 || x > W + 2) continue
      
      const isPast  = t < nowMs
      const isNearNow = Math.abs(t - nowMs) < MS.day
      
      // Determine grid line style based on temporal zone and importance
      let color: string
      let lineWidth: number
      let dashPattern: number[] | []
      
      if (isNearNow) {
        // Present zone - cyan tinted
        const alpha = isMajor ? (detail?.majorWeight || 0.5) : (detail?.minorWeight || 0.2)
        color = isMajor 
          ? COLORS.gridPresentMajor(alpha) 
          : COLORS.gridPresentMinor(alpha)
        lineWidth = isMajor ? 1.5 : 0.5
        dashPattern = []
      } else if (isPast) {
        // Past zone - subtle, faded
        const alpha = isMajor ? (detail?.majorWeight || 0.5) : (detail?.minorWeight || 0.2)
        color = isMajor 
          ? COLORS.gridPastMajor(alpha) 
          : COLORS.gridPastMinor(alpha)
        lineWidth = isMajor ? 1 : 0.5
        dashPattern = isMajor ? [] : [4, 12]
      } else {
        // Future zone - brighter, more visible
        const alpha = isMajor ? (detail?.majorWeight || 0.5) : (detail?.minorWeight || 0.2)
        color = isMajor 
          ? COLORS.gridFutureMajor(alpha) 
          : COLORS.gridFutureMinor(alpha)
        lineWidth = isMajor ? 1 : 0.5
        dashPattern = isMajor ? [] : [6, 8]
      }
      
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.setLineDash(dashPattern)
      ctx.stroke()
    }
  }
  ctx.setLineDash([])
}

// ─── Label layer (dispatches by scale) ────────────────────────────────────────
function drawScaleLabels(
  ctx:      CanvasRenderingContext2D,
  W:        number,
  H:        number,
  leftMs:   number,
  rightMs:  number,
  offsetMs: number,
  pxPerMs:  number,
  nowMs:    number,
  scaleIdx: number,
  detail:   DetailLevel | null,
): void {
  const labelSize = detail?.labelSize || 15
  
  if (scaleIdx <= 2) drawEraLabels(ctx, W, H, leftMs, rightMs, offsetMs, pxPerMs, nowMs, scaleIdx, labelSize)
  if (scaleIdx >= 2 && scaleIdx <= 5) drawYearLabels(ctx, W, H, leftMs, rightMs, offsetMs, pxPerMs, nowMs, scaleIdx, labelSize)
  if (scaleIdx >= 5 && scaleIdx <= 8) drawMonthLabels(ctx, W, H, leftMs, rightMs, offsetMs, pxPerMs, nowMs, scaleIdx, labelSize)
  if (scaleIdx >= 8 && scaleIdx <= 9) drawDayLabels(ctx, W, H, leftMs, rightMs, offsetMs, pxPerMs, nowMs, labelSize)
  if (scaleIdx >= 9) drawHourLabels(ctx, W, H, leftMs, rightMs, offsetMs, pxPerMs, nowMs, labelSize)
}

// ─── Era labels (decades, centuries) ──────────────────────────────────────────
function drawEraLabels(
  ctx:      CanvasRenderingContext2D,
  W:        number,
  H:        number,
  leftMs:   number,
  rightMs:  number,
  offsetMs: number,
  pxPerMs:  number,
  nowMs:    number,
  scaleIdx: number,
  labelSize: number,
): void {
  const nowYear = new Date(nowMs).getFullYear()
  const sd = new Date(leftMs)
  sd.setMonth(0, 1); sd.setHours(0, 0, 0, 0)
  
  // Find the start of the appropriate era
  const decadeStart = Math.floor(sd.getFullYear() / 10) * 10
  let t = new Date(decadeStart, 0, 1).getTime()

  while (t <= rightMs) {
    const d = new Date(t)
    const year = d.getFullYear()
    const nextT = new Date(year + 10, 0, 1).getTime()
    const x     = msToX(t, offsetMs, pxPerMs)
    const nextX = msToX(nextT, offsetMs, pxPerMs)
    const midX  = (x + nextX) / 2
    
    if (midX > 20 && midX < W - 20) {
      const isPast  = t < nowMs
      const isNearNow = Math.abs(year - nowYear) < 10
      
      ctx.font = `700 ${labelSize}px ${F_DISPLAY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      if (scaleIdx <= 1) {
        // Century view - show century
        const century = Math.ceil(year / 100)
        const label = `${century}${getOrdinalSuffix(century)} Century`
        ctx.fillStyle = isPast ? COLORS.labelPastMajor : COLORS.labelFutureMajor
        ctx.fillText(label, midX, H * 0.5)
      } else {
        // Decade view - show decade
        const decade = `${year}-${year + 9}`
        ctx.fillStyle = isPast ? COLORS.labelPastMajor : COLORS.labelFutureMajor
        ctx.fillText(decade, midX, H * 0.5 - 10)
        
        // Show representative year
        ctx.font = `400 ${labelSize * 0.5}px ${F_UI}`
        ctx.fillStyle = isPast ? COLORS.labelPastMinor : COLORS.labelFutureMinor
        ctx.fillText(`${year + 5}`, midX, H * 0.5 + 15)
      }
    }
    t = nextT
  }
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

// ─── Year labels ──────────────────────────────────────────────────────────────
function drawYearLabels(
  ctx:      CanvasRenderingContext2D,
  W:        number,
  H:        number,
  leftMs:   number,
  rightMs:  number,
  offsetMs: number,
  pxPerMs:  number,
  nowMs:    number,
  scaleIdx: number,
  labelSize: number,
): void {
  const nowYear = new Date(nowMs).getFullYear()
  const sd = new Date(leftMs)
  sd.setMonth(0, 1); sd.setHours(0, 0, 0, 0)
  let t = sd.getTime()

  while (t <= rightMs) {
    const d = new Date(t)
    const yr = d.getFullYear()
    const nextT = new Date(yr + 1, 0, 1).getTime()
    const x     = msToX(t, offsetMs, pxPerMs)
    const nextX = msToX(nextT, offsetMs, pxPerMs)
    const midX  = (x + nextX) / 2
    
    if (midX > 15 && midX < W - 15) {
      const isPast  = t < nowMs
      const isNow   = yr === nowYear
      const isNearNow = Math.abs(yr - nowYear) <= 1
      
      // Font size scales with proximity to now
      const fontSize = isNow ? labelSize * 1.2 : isNearNow ? labelSize : labelSize * 0.8
      
      ctx.font = `700 ${fontSize}px ${F_DISPLAY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      if (isNow) {
        ctx.fillStyle = COLORS.labelNow
        ctx.fillText(String(yr), midX, H * 0.5)
        
        // Add "NOW" indicator
        ctx.font = `600 ${fontSize * 0.35}px ${F_UI}`
        ctx.fillStyle = 'rgba(0,229,255,0.6)'
        ctx.letterSpacing = '0.2em'
        ctx.fillText('PRESENT', midX, H * 0.5 + fontSize * 0.7)
      } else if (isNearNow) {
        ctx.fillStyle = COLORS.labelPresent
        ctx.fillText(String(yr), midX, H * 0.5)
      } else {
        ctx.fillStyle = isPast ? COLORS.labelPastMajor : COLORS.labelFutureMajor
        ctx.fillText(String(yr), midX, H * 0.5)
      }
      
      // Show quarter markers at year scale
      if (scaleIdx <= 5) {
        for (let q = 1; q <= 3; q++) {
          const qMs = new Date(yr, q * 3, 1).getTime()
          if (qMs > leftMs && qMs < rightMs) {
            const qx = msToX(qMs, offsetMs, pxPerMs)
            ctx.font = `400 ${labelSize * 0.35}px ${F_MONO}`
            ctx.fillStyle = isPast ? COLORS.labelPastMinor : COLORS.labelFutureMinor
            ctx.fillText(`Q${q}`, qx, H * 0.5 + fontSize * 0.5)
          }
        }
      }
    }
    t = nextT
  }
}

// ─── Month labels ─────────────────────────────────────────────────────────────
function drawMonthLabels(
  ctx:      CanvasRenderingContext2D,
  W:        number,
  H:        number,
  _leftMs:  number,
  rightMs:  number,
  offsetMs: number,
  pxPerMs:  number,
  nowMs:    number,
  scaleIdx: number,
  labelSize: number,
): void {
  const nowDate   = new Date(nowMs)
  const sd = new Date(offsetMs)
  sd.setDate(1); sd.setHours(0,0,0,0)
  let d = new Date(sd.getFullYear(), sd.getMonth(), 1)

  while (d.getTime() <= rightMs) {
    const t    = d.getTime()
    const nd   = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const x    = msToX(t, offsetMs, pxPerMs)
    const nx   = msToX(nd.getTime(), offsetMs, pxPerMs)
    const midX = (x + nx) / 2
    
    if (midX > 10 && midX < W - 10) {
      const isPast = t < nowMs
      const isNow  = d.getMonth() === nowDate.getMonth() && d.getFullYear() === nowDate.getFullYear()
      const isNearNow = Math.abs(t - nowMs) < MS.month
      
      const fontSize = isNow ? labelSize * 1.15 : labelSize
      
      ctx.font = `600 ${fontSize}px ${F_DISPLAY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      if (isNow) {
        ctx.fillStyle = COLORS.labelNow
        ctx.fillText(MONTH_NAMES[d.getMonth()], midX, H * 0.5 - 8)
      } else if (isNearNow) {
        ctx.fillStyle = COLORS.labelPresent
        ctx.fillText(MONTH_NAMES[d.getMonth()], midX, H * 0.5 - 8)
      } else {
        ctx.fillStyle = isPast ? COLORS.labelPastMajor : COLORS.labelFutureMajor
        ctx.fillText(MONTH_NAMES[d.getMonth()], midX, H * 0.5 - 8)
      }
      
      // Show year below month at certain scales
      if (scaleIdx >= 6 || d.getMonth() === 0) {
        ctx.font = `400 ${labelSize * 0.55}px ${F_MONO}`
        ctx.fillStyle = isPast ? COLORS.labelPastMinor : COLORS.labelFutureMinor
        ctx.fillText(String(d.getFullYear()), midX, H * 0.5 + 12)
      }
    }
    d = nd
  }
}

// ─── Day labels ───────────────────────────────────────────────────────────────
function drawDayLabels(
  ctx:      CanvasRenderingContext2D,
  W:        number,
  H:        number,
  _leftMs:  number,
  rightMs:  number,
  offsetMs: number,
  pxPerMs:  number,
  nowMs:    number,
  labelSize: number,
): void {
  const nowDate = new Date(nowMs)
  const sd = new Date(offsetMs); sd.setHours(0,0,0,0)
  let t = sd.getTime()

  while (t <= rightMs + MS.day) {
    const x    = msToX(t, offsetMs, pxPerMs)
    const nx   = msToX(t + MS.day, offsetMs, pxPerMs)
    const midX = (x + nx) / 2
    
    if (midX > 8 && midX < W - 8) {
      const d      = new Date(t)
      const isPast = t < nowMs
      const isToday = d.toDateString() === nowDate.toDateString()
      const isNearNow = Math.abs(t - nowMs) < MS.day * 3
      
      ctx.textAlign   = 'center'
      ctx.textBaseline = 'middle'
      
      // Day number
      const dayFontSize = isToday ? labelSize * 1.2 : labelSize
      ctx.font = `600 ${dayFontSize}px ${F_DISPLAY}`
      
      if (isToday) {
        ctx.fillStyle = COLORS.labelNow
        ctx.fillText(String(d.getDate()), midX, H * 0.5 - 10)
        
        // Today indicator
        ctx.font = `500 ${labelSize * 0.4}px ${F_UI}`
        ctx.fillStyle = 'rgba(0,229,255,0.7)'
        ctx.fillText('TODAY', midX, H * 0.5 + 12)
      } else if (isNearNow) {
        ctx.fillStyle = COLORS.labelPresent
        ctx.fillText(String(d.getDate()), midX, H * 0.5 - 10)
      } else {
        ctx.fillStyle = isPast ? COLORS.labelPastMajor : COLORS.labelFutureMajor
        ctx.fillText(String(d.getDate()), midX, H * 0.5 - 10)
      }
      
      // Weekday name
      ctx.font = `400 ${labelSize * 0.55}px ${F_UI}`
      if (isToday) {
        ctx.fillStyle = 'rgba(0,229,255,0.5)'
      } else if (isNearNow) {
        ctx.fillStyle = COLORS.labelPresent
      } else {
        ctx.fillStyle = isPast ? COLORS.labelPastMinor : COLORS.labelFutureMinor
      }
      ctx.fillText(WEEKDAY_NAMES[d.getDay()], midX, H * 0.5 + 8)
    }
    t += MS.day
  }
}

// ─── Hour labels ──────────────────────────────────────────────────────────────
function drawHourLabels(
  ctx:      CanvasRenderingContext2D,
  W:        number,
  H:        number,
  _leftMs:  number,
  rightMs:  number,
  offsetMs: number,
  pxPerMs:  number,
  nowMs:    number,
  labelSize: number,
): void {
  const nowDate = new Date(nowMs)
  const sd = new Date(offsetMs); sd.setMinutes(0,0,0)
  let t = sd.getTime()

  while (t <= rightMs + MS.hour) {
    const x    = msToX(t, offsetMs, pxPerMs)
    const nx   = msToX(t + MS.hour, offsetMs, pxPerMs)
    const midX = (x + nx) / 2
    
    if (midX > 10 && midX < W - 10) {
      const d = new Date(t)
      const isPast = t < nowMs
      const isCurrentHour = d.getHours() === nowDate.getHours() && 
                           d.toDateString() === nowDate.toDateString()
      
      ctx.font = `500 ${labelSize}px ${F_MONO}`
      ctx.textAlign  = 'center'
      ctx.textBaseline = 'middle'
      
      if (isCurrentHour) {
        ctx.fillStyle = COLORS.labelNow
      } else {
        ctx.fillStyle = isPast ? 'rgba(120,120,160,0.35)' : 'rgba(160,170,220,0.55)'
      }
      
      ctx.fillText(formatHourLabel(d), midX, H * 0.5)
      
      // Show half-hour markers at close zoom
      if (pxPerMs > MS.day / 800) {
        const halfHour = t + MS.minute * 30
        const halfX = msToX(halfHour, offsetMs, pxPerMs)
        if (halfX > 0 && halfX < W) {
          ctx.font = `300 ${labelSize * 0.6}px ${F_MONO}`
          ctx.fillStyle = isPast ? 'rgba(100,100,140,0.2)' : 'rgba(140,150,200,0.35)'
          ctx.fillText('30', halfX, H * 0.5)
        }
      }
    }
    t += MS.hour
  }
}

// ─── Now line ─────────────────────────────────────────────────────────────────
function drawNowLine(
  ctx:  CanvasRenderingContext2D,
  W:    number,
  H:    number,
  nowX: number,
): void {
  if (nowX < -60 || nowX > W + 60) return
  
  // Wide glow band (soft background glow)
  const glowWidth = 80
  const glow = ctx.createLinearGradient(nowX - glowWidth, 0, nowX + glowWidth, 0)
  glow.addColorStop(0, 'rgba(0,229,255,0)')
  glow.addColorStop(0.3, 'rgba(0,229,255,0.04)')
  glow.addColorStop(0.5, 'rgba(0,229,255,0.08)')
  glow.addColorStop(0.7, 'rgba(0,229,255,0.04)')
  glow.addColorStop(1, 'rgba(0,229,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(nowX - glowWidth, 0, glowWidth * 2, H)
  
  // Crisp 2px line
  ctx.beginPath()
  ctx.moveTo(nowX, 0)
  ctx.lineTo(nowX, H)
  ctx.strokeStyle = COLORS.nowLine
  ctx.lineWidth   = 2
  ctx.setLineDash([])
  ctx.stroke()
  
  // Top pip dot with glow
  ctx.beginPath()
  ctx.arc(nowX, 6, 5, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.nowLine
  ctx.fill()
  
  // Outer glow for pip
  ctx.beginPath()
  ctx.arc(nowX, 6, 8, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,229,255,0.2)'
  ctx.fill()
}

// ─── Now pulse animation effect ──────────────────────────────────────────────
function drawNowPulse(
  ctx:  CanvasRenderingContext2D,
  W:    number,
  H:    number,
  nowX: number,
): void {
  if (nowX < -100 || nowX > W + 100) return
  
  const time = Date.now() / 2000 // 2 second cycle
  const pulse = (Math.sin(time * Math.PI) + 1) * 0.5 // 0 to 1
  const pulseWidth = 150 + pulse * 100
  const pulseAlpha = 0.02 + pulse * 0.03
  
  const pulseGlow = ctx.createRadialGradient(nowX, H * 0.5, 0, nowX, H * 0.5, pulseWidth)
  pulseGlow.addColorStop(0, `rgba(0,229,255,${pulseAlpha})`)
  pulseGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = pulseGlow
  ctx.fillRect(Math.max(0, nowX - pulseWidth), 0, Math.min(pulseWidth * 2, W), H)
}