'use client'
import { useEffect, useState } from 'react'
import { nowInLusaka, formatClock } from '@/lib/timeEngine'

export interface LiveClock {
  nowMs:     number
  clockStr:  string   // "HH:MM:SS"
}

export function useLiveClock(intervalMs = 1000): LiveClock {
  const [clock, setClock] = useState<LiveClock>(() => {
    const n = nowInLusaka()
    return { nowMs: n.getTime(), clockStr: formatClock(n) }
  })

  useEffect(() => {
    const tick = () => {
      const n = nowInLusaka()
      setClock({ nowMs: n.getTime(), clockStr: formatClock(n) })
    }
    const id = setInterval(tick, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return clock
}
