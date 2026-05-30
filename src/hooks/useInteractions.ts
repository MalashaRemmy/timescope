'use client'
import { useRef, useCallback, useEffect } from 'react'
import type { RefObject } from 'react'

interface InteractionHandlers {
  onPan?: (dxPx: number) => void
  onZoom?: (delta: number, pivotX: number) => void
  onPanStart?: (x: number) => void
  onPanMove?: (x: number) => void
  onPanEnd?: (velocity: number) => void
  onDoubleClick?: (x: number) => void
  onRightClick?: (x: number) => void
}

interface DragState {
  active: boolean
  startX: number
  lastX: number
  startTime: number
  timestamp: number
  velocity: number
}

interface PinchState {
  active: boolean
  startDist: number
  lastDist: number
  center: { x: number; y: number }
  startScale: number
}

// ─── Calculate distance between two touch points ─────────────────────────────
function getTouchDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch2.clientX - touch1.clientX
  const dy = touch2.clientY - touch1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// ─── Calculate center point between two touch points ─────────────────────────
function getTouchCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  }
}

// ─── Main hook ───────────────────────────────────────────────────────────────
export function useInteractions(
  ref: RefObject<HTMLElement | null>,
  handlers: InteractionHandlers,
) {
  const dragState = useRef<DragState>({
    active: false,
    startX: 0,
    lastX: 0,
    startTime: 0,
    timestamp: 0,
    velocity: 0,
  })
  
  const pinchState = useRef<PinchState>({
    active: false,
    startDist: 0,
    lastDist: 0,
    center: { x: 0, y: 0 },
    startScale: 1,
  })
  
  const lastTapTime = useRef<number>(0)
  const wheelAccumulator = useRef<number>(0)
  
  // ─── Mouse handlers ────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Ignore right clicks and middle clicks
    if (e.button !== 0) return
    
    dragState.current = {
      active: true,
      startX: e.clientX,
      lastX: e.clientX,
      startTime: Date.now(),
      timestamp: Date.now(),
      velocity: 0,
    }
    
    handlers.onPanStart?.(e.clientX)
  }, [handlers])
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.active) return
    
    const dx = e.clientX - dragState.current.lastX
    const dt = Date.now() - dragState.current.timestamp
    const velocity = dt > 0 ? dx / dt : 0
    
    dragState.current = {
      ...dragState.current,
      lastX: e.clientX,
      velocity,
      timestamp: Date.now(),
    }
    
    handlers.onPanMove?.(e.clientX)
    handlers.onPan?.(dx)
  }, [handlers])
  
  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragState.current.active) return
    
    const velocity = dragState.current.velocity
    dragState.current.active = false
    
    handlers.onPanEnd?.(velocity)
    
    // Detect double click
    const now = Date.now()
    if (now - lastTapTime.current < 300) {
      handlers.onDoubleClick?.(e.clientX)
    }
    lastTapTime.current = now
  }, [handlers])
  
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    
    // Accumulate wheel delta for smoother zooming
    wheelAccumulator.current += e.deltaY
    
    // Threshold for zoom step
    const threshold = 50
    if (Math.abs(wheelAccumulator.current) >= threshold) {
      const direction = Math.sign(wheelAccumulator.current)
      wheelAccumulator.current = 0
      
      handlers.onZoom?.(direction, e.clientX)
    }
  }, [handlers])
  
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault()
    handlers.onRightClick?.(e.clientX)
  }, [handlers])
  
  // ─── Touch handlers ────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - start drag
      const touch = e.touches[0]
      dragState.current = {
        active: true,
        startX: touch.clientX,
        lastX: touch.clientX,
        startTime: Date.now(),
        velocity: 0,
        timestamp: Date.now(),
      }
      handlers.onPanStart?.(touch.clientX)
    } else if (e.touches.length === 2) {
      // Two touches - start pinch
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dist = getTouchDistance(touch1, touch2)
      const center = getTouchCenter(touch1, touch2)
      
      pinchState.current = {
        active: true,
        startDist: dist,
        lastDist: dist,
        center,
        startScale: 1,
      }
      
      // Cancel any ongoing drag
      if (dragState.current.active) {
        dragState.current.active = false
        handlers.onPanEnd?.(0)
      }
    }
  }, [handlers])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 1 && dragState.current.active) {
      // Single touch - continue drag
      const touch = e.touches[0]
      const dx = touch.clientX - dragState.current.lastX
      const dt = Date.now() - (dragState.current.timestamp || Date.now())
      const velocity = dt > 0 ? dx / dt : 0
      
      dragState.current = {
        ...dragState.current,
        lastX: touch.clientX,
        velocity,
        timestamp: Date.now(),
      }
      
      handlers.onPanMove?.(touch.clientX)
      handlers.onPan?.(dx)
    } else if (e.touches.length === 2 && pinchState.current.active) {
      // Two touches - continue pinch
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dist = getTouchDistance(touch1, touch2)
      const center = getTouchCenter(touch1, touch2)
      
      const scaleChange = dist / pinchState.current.startDist
      const delta = (scaleChange - 1) * 100 // Convert to zoom delta
      
      pinchState.current = {
        ...pinchState.current,
        lastDist: dist,
        center,
      }
      
      handlers.onZoom?.(-delta, center.x) // Negative because pinch out = zoom in
    }
  }, [handlers])
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length === 0) {
      // All touches ended
      if (dragState.current.active) {
        const velocity = dragState.current.velocity
        dragState.current.active = false
        handlers.onPanEnd?.(velocity)
      }
      
      if (pinchState.current.active) {
        pinchState.current.active = false
      }
    } else if (e.touches.length === 1) {
      // Went from pinch to drag
      if (pinchState.current.active) {
        pinchState.current.active = false
        
        const touch = e.touches[0]
        dragState.current = {
          active: true,
          startX: touch.clientX,
          lastX: touch.clientX,
          startTime: Date.now(),
          velocity: 0,
          timestamp: Date.now(),
        }
        handlers.onPanStart?.(touch.clientX)
      }
    }
  }, [handlers])
  
  // ─── Keyboard handlers ─────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default for navigation keys when not in input
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'h':
        e.preventDefault()
        handlers.onPan?.(-100) // Pan left by 100px
        break
      case 'ArrowRight':
      case 'l':
        e.preventDefault()
        handlers.onPan?.(100) // Pan right by 100px
        break
      case '+':
      case '=':
        e.preventDefault()
        handlers.onZoom?.(-1, window.innerWidth / 2) // Zoom in
        break
      case '-':
        e.preventDefault()
        handlers.onZoom?.(1, window.innerWidth / 2) // Zoom out
        break
      case 'n':
      case 'N':
        e.preventDefault()
        // Signal to go to now (handled by parent)
        break
    }
  }, [handlers])
  
  // ─── Attach event listeners ────────────────────────────────────────────────
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    // Mouse events
    element.addEventListener('mousedown', handleMouseDown)
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseup', handleMouseUp)
    element.addEventListener('wheel', handleWheel, { passive: false })
    element.addEventListener('contextmenu', handleContextMenu)
    
    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)
    element.addEventListener('touchcancel', handleTouchEnd)
    
    // Keyboard events (on window)
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseup', handleMouseUp)
      element.removeEventListener('wheel', handleWheel)
      element.removeEventListener('contextmenu', handleContextMenu)
      
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
      
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    ref,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleContextMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
  ])
  
  // ─── Return interaction state ──────────────────────────────────────────────
  return {
    isDragging: dragState.current.active,
    isPinching: pinchState.current.active,
    dragVelocity: dragState.current.velocity,
  }
}