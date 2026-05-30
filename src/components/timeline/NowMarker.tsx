'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { SCALES } from '@/lib/constants'
import { msToX } from '@/lib/timeEngine'

interface Props {
  nowMs:    number
  offsetMs: number
  scaleIdx: number
  width:    number
}

export default function NowMarker({ nowMs, offsetMs, scaleIdx, width }: Props) {
  const nowX = useMemo(() => {
    const pxPerMs = SCALES[scaleIdx].pxPerMs
    return msToX(nowMs, offsetMs, pxPerMs)
  }, [nowMs, offsetMs, scaleIdx])

  // Clamp tooltip position so it's always visible
  const clampedX = Math.max(40, Math.min(width - 80, nowX))

  return (
    <motion.div
      className="absolute top-[58px] z-50 pointer-events-none"
      style={{ left: clampedX }}
      animate={{ left: clampedX }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
    >
      <div
        className="
          -translate-x-1/2 translate-x-0
          px-3 py-1 rounded-full
          border border-now/40 bg-now/10
          text-now font-mono text-[11px] tracking-wider
          animate-pulse-now whitespace-nowrap
        "
        style={{ transform: 'translateX(-50%)' }}
      >
        ▼ NOW
      </div>
    </motion.div>
  )
}
