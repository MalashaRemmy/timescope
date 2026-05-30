'use client'
import { useEffect, useRef, useCallback } from 'react'

interface CanvasSize {
  canvasRef: React.RefObject<HTMLCanvasElement>
  getContext: () => CanvasRenderingContext2D | null
}

export function useCanvasSize(
  onResize: (w: number, h: number) => void,
): CanvasSize {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const applySize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w   = canvas.offsetWidth
    const h   = canvas.offsetHeight
    
    // Reset canvas dimensions
    canvas.width  = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    
    // Get and reset context transform to avoid accumulating scales
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)  // Reset any existing transform
      ctx.scale(dpr, dpr)                  // Apply DPR scale
    }
    
    onResize(w, h)
  }, [onResize])

  useEffect(() => {
    applySize()
    const ro = new ResizeObserver(applySize)
    if (canvasRef.current) ro.observe(canvasRef.current)
    return () => ro.disconnect()
  }, [applySize])

  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    return canvasRef.current?.getContext('2d') ?? null
  }, [])

  return { canvasRef, getContext }
}
