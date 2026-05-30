'use client'
import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useViewport } from '@/hooks/useViewport'
import { useLiveClock } from '@/hooks/useLiveClock'
import TimelineCanvas from '@/components/timeline/TimelineCanvas'
import NowMarker from '@/components/timeline/NowMarker'
import Header from '@/components/ui/Header'
import HUD from '@/components/hud/HUD'

export default function TimeScopePage() {
  const {
    state,
    zoomIn,
    zoomOut,
    pan,
    panStart,
    panMove,
    panEnd,
    centerOn,
    resize,
    centerMs,
    visibleRange,
  } = useViewport()
  
  const { nowMs, clockStr } = useLiveClock()
  const rafRef = useRef<number>()
  
  // Center on now on first resize (width transitions from 0)
  const handleResize = useCallback((w: number, h: number) => {
    resize(w, h)
    if (state.width === 0 && w > 0) {
      centerOn(nowMs, false)
    }
  }, [resize, state.width, centerOn, nowMs])

  const handleGoToNow = useCallback(() => {
    centerOn(nowMs, true)
  }, [centerOn, nowMs])

  const handleZoomIn = useCallback((pivotX?: number) => {
    zoomIn(pivotX ?? state.width / 2)
  }, [zoomIn, state.width])

  const handleZoomOut = useCallback((pivotX?: number) => {
    zoomOut(pivotX ?? state.width / 2)
  }, [zoomOut, state.width])

  // Handle pan with inertia
  const handlePan = useCallback((dxPx: number) => {
    const pxPerMs = state.pxPerMs
    pan(dxPx / pxPerMs)
  }, [state.pxPerMs, pan])

  const handlePanStart = useCallback((x: number) => {
    panStart(x)
  }, [panStart])

  const handlePanMove = useCallback((x: number) => {
    panMove(x)
  }, [panMove])

  const handlePanEnd = useCallback((velocity: number) => {
    const pxPerMs = state.pxPerMs
    panEnd(velocity / pxPerMs)
  }, [state.pxPerMs, panEnd])

  const handleZoom = useCallback((delta: number, pivotX: number) => {
    if (delta > 0) {
      zoomOut(pivotX)
    } else {
      zoomIn(pivotX)
    }
  }, [zoomIn, zoomOut])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch (e.key) {
        case 'n':
        case 'N':
          e.preventDefault()
          handleGoToNow()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleGoToNow])

  // Get visible range for HUD
  const range = visibleRange()

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-screen overflow-hidden bg-bg-deep-space"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-deep-space/50 via-transparent to-bg-deep-space/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-deep-space/20 via-transparent to-bg-deep-space/20" />
      </div>

      {/* Header */}
      <Header
        clockStr={clockStr}
        scaleIdx={state.scaleIdx}
        centerMs={centerMs()}
      />

      {/* Now tooltip (when near current time) */}
      {state.width > 0 && (
        <NowMarker
          nowMs={nowMs}
          offsetMs={state.offsetMs}
          scaleIdx={state.scaleIdx}
          width={state.width}
        />
      )}

      {/* Main Timeline Canvas */}
      <TimelineCanvas
        offsetMs={state.offsetMs}
        scaleIdx={state.scaleIdx}
        nowMs={nowMs}
        onPan={handlePan}
        onPanStart={handlePanStart}
        onPanMove={handlePanMove}
        onPanEnd={handlePanEnd}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoom={handleZoom}
        onResize={handleResize}
      />

      {/* HUD Controls */}
      <HUD
        scaleIdx={state.scaleIdx}
        isAnimating={state.isAnimating}
        onZoomIn={() => handleZoomIn()}
        onZoomOut={() => handleZoomOut()}
        onGoToNow={handleGoToNow}
        nowMs={nowMs}
        centerMs={centerMs()}
        visibleRange={range}
      />

      {/* Instructions overlay (fades out) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 4, duration: 1 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-[50]"
      >
        <div className="text-[10px] text-text-tertiary/60 font-mono tracking-wider text-center">
          Drag to pan • Scroll to zoom • Press N for now
        </div>
      </motion.div>
    </motion.main>
  )
}