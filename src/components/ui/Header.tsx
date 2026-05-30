'use client'
import { SCALES, TIMEZONE_ABBR } from '@/lib/constants'
import { formatDateShort } from '@/lib/timeEngine'

interface Props {
  clockStr: string
  scaleIdx: number
  centerMs: number
}

export default function Header({ clockStr, scaleIdx, centerMs }: Props) {
  const scaleName = SCALES[scaleIdx].label
  const centerDate = new Date(centerMs)

  return (
    <header className="
      absolute top-0 left-0 right-0 z-[100]
      flex items-center justify-between
      px-6 md:px-8 pt-5 pb-4
      pointer-events-none
      bg-gradient-to-b from-bg-deep-space/95 via-bg-deep-space/80 to-transparent
    ">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-primary/80 font-display">
          <span className="text-text-primary">TIM</span>
          <span className="text-now">∞</span>
          <span className="text-text-primary">SCOPE</span>
        </div>
        
        {/* Scale badge */}
        <div className="
          hidden sm:flex items-center gap-2
          text-[9px] font-semibold tracking-[0.15em] uppercase
          text-accent/80 border border-accent/20
          px-2.5 py-1 rounded-full bg-accent/5
          font-display
        ">
          <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
          {scaleName}
        </div>
      </div>

      {/* Center: Current temporal position */}
      <div className="hidden md:flex items-center gap-4">
        <div className="text-[10px] text-text-tertiary font-mono tracking-wider">
          {formatDateShort(centerMs)}
        </div>
      </div>

      {/* Right: Live clock */}
      <div className="flex items-center gap-4">
        {/* Timezone indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[9px] text-text-tertiary font-mono tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
          {TIMEZONE_ABBR}
        </div>
        
        {/* Clock */}
        <div className="text-[11px] text-text-secondary font-mono tracking-widest tabular-nums">
          {clockStr}
        </div>
      </div>
    </header>
  )
}