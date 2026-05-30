'use client'
import { motion } from 'framer-motion'
import { SCALES, MIN_SCALE_IDX, MAX_SCALE_IDX } from '@/lib/constants'
import { formatDateShort } from '@/lib/timeEngine'

interface Props {
  scaleIdx: number
  isAnimating: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onGoToNow: () => void
  nowMs: number
  centerMs: number
  visibleRange?: [number, number]
}

export default function HUD({
  scaleIdx,
  isAnimating,
  onZoomIn,
  onZoomOut,
  onGoToNow,
  nowMs,
  centerMs,
  visibleRange: range,
}: Props) {
  const canZoomIn = scaleIdx < MAX_SCALE_IDX
  const canZoomOut = scaleIdx > MIN_SCALE_IDX
  const currentScale = SCALES[scaleIdx]
  
  // Calculate visible date range
  const startDate = range ? new Date(range[0]) : null
  const endDate = range ? new Date(range[1]) : null
  const centerDate = new Date(centerMs)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="
        absolute bottom-6 left-1/2 -translate-x-1/2
        flex items-center gap-2
        z-[100]
        glass-strong
        px-4 py-2.5 rounded-2xl
        shadow-2xl shadow-black/40
      "
    >
      {/* Zoom out button */}
      <HudBtn
        onClick={onZoomOut}
        disabled={!canZoomOut}
        title={`Zoom out to ${SCALES[Math.max(scaleIdx - 1, MIN_SCALE_IDX)].label}`}
        ariaLabel="Zoom out"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </HudBtn>

      {/* Scale indicator dots */}
      <div className="flex items-center gap-1.5 px-2">
        {SCALES.map((_, i) => {
          const isActive = i === scaleIdx
          const isNear = Math.abs(i - scaleIdx) <= 1
          return (
            <div
              key={i}
              className={`
                rounded-full transition-all duration-300
                ${isActive
                  ? 'w-5 h-1.5 bg-now'
                  : isNear
                    ? 'w-1.5 h-1.5 bg-white/30'
                    : 'w-1 h-1 bg-white/10'}
              `}
            />
          )
        })}
      </div>

      {/* Zoom in button */}
      <HudBtn
        onClick={onZoomIn}
        disabled={!canZoomIn}
        title={`Zoom in to ${SCALES[Math.min(scaleIdx + 1, MAX_SCALE_IDX)].label}`}
        ariaLabel="Zoom in"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </HudBtn>

      {/* Separator */}
      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Scale label */}
      <div className="flex flex-col items-center px-2">
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-accent">
          {currentScale.label}
        </span>
        {startDate && endDate && (
          <span className="text-[9px] text-text-tertiary font-mono">
            {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            {' – '}
            {endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Now button */}
      <button
        onClick={onGoToNow}
        title="Jump to present moment"
        className={`
          flex items-center gap-2
          px-3 py-1.5 rounded-xl
          border border-now/30 
          bg-now/10 text-now
          text-[10px] font-semibold tracking-[0.12em] uppercase
          hover:bg-now/20 active:scale-95
          transition-all duration-200
          font-display cursor-pointer
          ${isAnimating ? 'animate-pulse' : ''}
        `}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-now opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-now"></span>
        </span>
        Now
      </button>
    </motion.div>
  )
}

// ─── Small round HUD button ───────────────────────────────────────────────────
function HudBtn({
  children, onClick, disabled, title, ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
  title: string
  ariaLabel: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`
        w-8 h-8 rounded-xl
        flex items-center justify-center
        border transition-all duration-200
        cursor-pointer font-display
        ${disabled
          ? 'border-transparent text-text-tertiary/30'
          : 'border-white/10 bg-white/5 text-text-primary hover:border-accent/50 hover:bg-accent/10 hover:text-accent active:scale-95'}
      `}
    >
      {children}
    </button>
  )
}