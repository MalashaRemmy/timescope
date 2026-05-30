'use client'
import { useRef, useEffect, useCallback } from 'react'
import { useCanvasSize } from '@/hooks/useCanvasSize'
import { useInteractions } from '@/hooks/useInteractions'
import { renderTimeline } from '@/lib/canvasRenderer'
import { SCALES } from '@/lib/constants'

interface Props {
  offsetMs: number
  scaleIdx: number
  nowMs: number
  onPan: (dxPx: number) => void
  onPanStart?: (x: number) => void
  onPanMove?: (x: number) => void
  onPanEnd?: (velocity: number) => void
  onZoomIn: (pivotX: number) => void
  onZoomOut: (pivotX: number) => void
  onZoom?: (delta: number, pivotX: number) => void
  onResize: (w: number, h: number) => void
}

export default function TimelineCanvas({
  offsetMs,
  scaleIdx,
  nowMs,
  onPan,
  onPanStart,
  onPanMove,
  onPanEnd,
  onZoomIn,
  onZoomOut,
  onZoom,
  onResize,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { canvasRef, getContext } = useCanvasSize(onResize)

  // Render whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = getContext()
    if (!ctx || !canvas) return
    
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (!w || !h) return
    
    const pxPerMs = SCALES[scaleIdx].pxPerMs
    renderTimeline(ctx, w, h, offsetMs, pxPerMs, nowMs, scaleIdx)
  }, [offsetMs, scaleIdx, nowMs, getContext, canvasRef])

  // Ensure canvas is properly initialized on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Set initial size if needed
    if (canvas.width === 0 || canvas.height === 0) {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w > 0 && h > 0) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0)
          ctx.scale(dpr, dpr)
        }
      }
    }
  }, [canvasRef])

  // Handle pan interactions
  const handlePan = useCallback(
    (dxPx: number) => {
      const pxPerMs = SCALES[scaleIdx].pxPerMs
      onPan(dxPx / pxPerMs)
    },
    [scaleIdx, onPan],
  )

  // Handle zoom interactions
  const handleZoom = useCallback(
    (delta: number, pivotX: number) => {
      if (onZoom) {
        onZoom(delta, pivotX)
      } else {
        if (delta > 0) onZoomOut(pivotX)
        else onZoomIn(pivotX)
      }
    },
    [onZoom, onZoomIn, onZoomOut],
  )

  // Attach interaction handlers
  useInteractions(wrapperRef, {
    onPan: handlePan,
    onZoom: handleZoom,
    onPanStart,
    onPanMove,
    onPanEnd,
  })

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 w-full h-full select-none cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        aria-label="TimeScope temporal visualization canvas"
      />
    </div>
  )
}