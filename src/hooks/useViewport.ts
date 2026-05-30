'use client'
import { useCallback, useReducer, useRef, useEffect } from 'react'
import {
  SCALES, DEFAULT_SCALE_IDX, MIN_SCALE_IDX, MAX_SCALE_IDX,
  ANIMATION,
} from '@/lib/constants'
import {
  zoomAroundPivot, centerOffsetMs, xToMs, msToX, lerp,
} from '@/lib/timeEngine'
import type { ViewportState, DragState } from '@/types'

// ─── Animation state for smooth transitions ──────────────────────────────────
interface AnimationState {
  active: boolean
  fromOffsetMs: number
  toOffsetMs: number
  fromScaleIdx: number
  toScaleIdx: number
  startTime: number
  duration: number
  pivotX: number
}

// ─── Extended state with animation ───────────────────────────────────────────
interface ExtendedState extends ViewportState {
  animation: AnimationState | null
  isAnimating: boolean
  drag?: DragState
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ZOOM_IN';  pivotX: number }
  | { type: 'ZOOM_OUT'; pivotX: number }
  | { type: 'ZOOM_TO';  targetScale: number; pivotX: number }
  | { type: 'PAN';      dxMs: number }
  | { type: 'PAN_START'; x: number }
  | { type: 'PAN_MOVE'; x: number }
  | { type: 'PAN_END';  velocity: number }
  | { type: 'CENTER_ON'; ms: number; animated?: boolean }
  | { type: 'RESIZE';   width: number; height: number }
  | { type: 'TICK';     timestamp: number }
  | { type: 'SET_OFFSET'; offsetMs: number }

function reducer(state: ExtendedState, action: Action): ExtendedState {
  switch (action.type) {
    case 'ZOOM_IN': {
      const next = Math.min(state.scaleIdx + 1, MAX_SCALE_IDX)
      if (next === state.scaleIdx) return state
      return performZoom(state, next, action.pivotX)
    }
    
    case 'ZOOM_OUT': {
      const next = Math.max(state.scaleIdx - 1, MIN_SCALE_IDX)
      if (next === state.scaleIdx) return state
      return performZoom(state, next, action.pivotX)
    }
    
    case 'ZOOM_TO': {
      const target = Math.max(MIN_SCALE_IDX, Math.min(MAX_SCALE_IDX, action.targetScale))
      return performZoom(state, target, action.pivotX)
    }
    
    case 'PAN': {
      // Direct pan (no animation)
      return {
        ...state,
        offsetMs: state.offsetMs - action.dxMs,
      }
    }
    
    case 'PAN_START': {
      return {
        ...state,
        drag: {
          active: true,
          lastX: action.x,
          velocity: 0,
          timestamp: Date.now(),
        },
      }
    }
    
    case 'PAN_MOVE': {
      if (!state.drag?.active) return state
      
      const dx = action.x - state.drag.lastX
      const dt = Date.now() - state.drag.timestamp
      const velocity = dt > 0 ? dx / dt : 0
      
      return {
        ...state,
        offsetMs: state.offsetMs - dx / state.pxPerMs,
        drag: {
          ...state.drag,
          lastX: action.x,
          velocity,
          timestamp: Date.now(),
        },
      }
    }
    
    case 'PAN_END': {
      // Apply inertia if velocity is significant
      const velocity = action.velocity
      if (Math.abs(velocity) > 0.5) {
        const inertiaDistance = velocity * 500 // pixels of inertia
        return {
          ...state,
          offsetMs: state.offsetMs - inertiaDistance / state.pxPerMs,
          drag: undefined,
        }
      }
      
      return {
        ...state,
        drag: undefined,
      }
    }
    
    case 'CENTER_ON': {
      if (action.animated) {
        const targetOffset = centerOffsetMs(action.ms, state.width, state.pxPerMs)
        return {
          ...state,
          animation: {
            active: true,
            fromOffsetMs: state.offsetMs,
            toOffsetMs: targetOffset,
            fromScaleIdx: state.scaleIdx,
            toScaleIdx: state.scaleIdx,
            startTime: Date.now(),
            duration: ANIMATION.zoomDuration,
            pivotX: state.width / 2,
          },
          isAnimating: true,
        }
      }
      
      return {
        ...state,
        offsetMs: centerOffsetMs(action.ms, state.width, state.pxPerMs),
      }
    }
    
    case 'RESIZE': {
      return { 
        ...state, 
        width: action.width, 
        height: action.height 
      }
    }
    
    case 'TICK': {
      // Handle animation frame
      if (!state.animation?.active) {
        return { ...state, isAnimating: false }
      }
      
      const elapsed = action.timestamp - state.animation.startTime
      const progress = Math.min(elapsed / state.animation.duration, 1)
      
      // Smooth easing
      const eased = easeInOutCubic(progress)
      
      const currentOffset = lerp(
        state.animation.fromOffsetMs,
        state.animation.toOffsetMs,
        eased
      )
      
      if (progress >= 1) {
        // Animation complete
        return {
          ...state,
          offsetMs: state.animation.toOffsetMs,
          scaleIdx: state.animation.toScaleIdx,
          pxPerMs: SCALES[state.animation.toScaleIdx].pxPerMs,
          animation: null,
          isAnimating: false,
        }
      }
      
      return {
        ...state,
        offsetMs: currentOffset,
      }
    }
    
    case 'SET_OFFSET': {
      return { ...state, offsetMs: action.offsetMs }
    }
    
    default:
      return state
  }
}

// ─── Helper: Perform animated zoom ───────────────────────────────────────────
function performZoom(
  state: ExtendedState,
  targetScaleIdx: number,
  pivotX: number,
): ExtendedState {
  const pivotMs = xToMs(pivotX, state.offsetMs, state.pxPerMs)
  const newPxPerMs = SCALES[targetScaleIdx].pxPerMs
  const targetOffset = zoomAroundPivot(pivotMs, pivotX, newPxPerMs)
  
  return {
    ...state,
    animation: {
      active: true,
      fromOffsetMs: state.offsetMs,
      toOffsetMs: targetOffset,
      fromScaleIdx: state.scaleIdx,
      toScaleIdx: targetScaleIdx,
      startTime: Date.now(),
      duration: ANIMATION.zoomDuration,
      pivotX,
    },
    isAnimating: true,
    // Keep current values during animation
  }
}

// ─── Easing functions ────────────────────────────────────────────────────────
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ─── Initial state ───────────────────────────────────────────────────────────
function initialState(): ExtendedState {
  const scale = SCALES[DEFAULT_SCALE_IDX]
  return {
    scaleIdx: DEFAULT_SCALE_IDX,
    pxPerMs: scale.pxPerMs,
    offsetMs: 0,
    width: 0,
    height: 0,
    animation: null,
    isAnimating: false,
    drag: undefined,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useViewport() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const animationFrameRef = useRef<number>()
  
  // Animation loop for smooth transitions
  useEffect(() => {
    function tick(timestamp: number) {
      if (state.isAnimating) {
        dispatch({ type: 'TICK', timestamp })
      }
      animationFrameRef.current = requestAnimationFrame(tick)
    }
    
    animationFrameRef.current = requestAnimationFrame(tick)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state.isAnimating])
  
  const zoomIn = useCallback((pivotX: number) => {
    dispatch({ type: 'ZOOM_IN', pivotX })
  }, [])
  
  const zoomOut = useCallback((pivotX: number) => {
    dispatch({ type: 'ZOOM_OUT', pivotX })
  }, [])
  
  const zoomTo = useCallback((scale: number, pivotX: number) => {
    dispatch({ type: 'ZOOM_TO', targetScale: scale, pivotX })
  }, [])
  
  const pan = useCallback((dxMs: number) => {
    dispatch({ type: 'PAN', dxMs })
  }, [])
  
  const panStart = useCallback((x: number) => {
    dispatch({ type: 'PAN_START', x })
  }, [])
  
  const panMove = useCallback((x: number) => {
    dispatch({ type: 'PAN_MOVE', x })
  }, [])
  
  const panEnd = useCallback((velocity: number) => {
    dispatch({ type: 'PAN_END', velocity })
  }, [])
  
  const centerOn = useCallback((ms: number, animated = true) => {
    dispatch({ type: 'CENTER_ON', ms, animated })
  }, [])
  
  const resize = useCallback((w: number, h: number) => {
    dispatch({ type: 'RESIZE', width: w, height: h })
  }, [])
  
  const setOffset = useCallback((offsetMs: number) => {
    dispatch({ type: 'SET_OFFSET', offsetMs })
  }, [])
  
  // Calculate center position
  const centerMs = useCallback((): number => {
    return state.offsetMs + state.width / 2 / state.pxPerMs
  }, [state.offsetMs, state.width, state.pxPerMs])
  
  // Get visible time range
  const visibleRange = useCallback((): [number, number] => {
    const startMs = state.offsetMs
    const endMs = state.offsetMs + state.width / state.pxPerMs
    return [startMs, endMs]
  }, [state.offsetMs, state.width, state.pxPerMs])
  
  // Convert screen X to timestamp
  const xToTimestamp = useCallback((x: number): number => {
    return xToMs(x, state.offsetMs, state.pxPerMs)
  }, [state.offsetMs, state.pxPerMs])
  
  // Convert timestamp to screen X
  const timestampToX = useCallback((ms: number): number => {
    return msToX(ms, state.offsetMs, state.pxPerMs)
  }, [state.offsetMs, state.pxPerMs])
  
  return {
    state: {
      scaleIdx: state.scaleIdx,
      pxPerMs: state.pxPerMs,
      offsetMs: state.offsetMs,
      width: state.width,
      height: state.height,
      isAnimating: state.isAnimating,
      drag: state.drag,
    },
    zoomIn,
    zoomOut,
    zoomTo,
    pan,
    panStart,
    panMove,
    panEnd,
    centerOn,
    resize,
    setOffset,
    centerMs,
    visibleRange,
    xToTimestamp,
    timestampToX,
  }
}