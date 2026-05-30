'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { SCALES } from '@/lib/constants'

interface Props {
  scaleIdx: number
}

export default function ScaleTransition({ scaleIdx }: Props) {
  const name = SCALES[scaleIdx].label
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={name}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
      >
        {name}
      </motion.span>
    </AnimatePresence>
  )
}
