import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  homeScore: number
  awayScore: number
  minute?: number
  isLive?: boolean
  className?: string
}

export function HeroScore({ homeScore, awayScore, minute, isLive, className }: Props) {
  const prevHome = useRef(homeScore)
  const prevAway = useRef(awayScore)
  const [flashSide, setFlashSide] = useState<'home' | 'away' | null>(null)

  useEffect(() => {
    if (homeScore > prevHome.current) {
      setFlashSide('home')
      const t = setTimeout(() => setFlashSide(null), 1200)
      prevHome.current = homeScore
      return () => clearTimeout(t)
    }
    prevHome.current = homeScore
  }, [homeScore])

  useEffect(() => {
    if (awayScore > prevAway.current) {
      setFlashSide('away')
      const t = setTimeout(() => setFlashSide(null), 1200)
      prevAway.current = awayScore
      return () => clearTimeout(t)
    }
    prevAway.current = awayScore
  }, [awayScore])

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <ScoreDigit value={homeScore} flashing={flashSide === 'home'} />

      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-5xl text-[--text-muted] leading-none">:</span>
        {isLive && minute != null && (
          <span className="font-body text-[11px] font-bold text-live tracking-wider">
            {minute}&apos;
          </span>
        )}
      </div>

      <ScoreDigit value={awayScore} flashing={flashSide === 'away'} />
    </div>
  )
}

function ScoreDigit({ value, flashing }: { value: number; flashing: boolean }) {
  return (
    <div className="relative">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          className={cn(
            'font-display text-[72px] leading-none tabular-nums block',
            flashing ? 'text-score-great' : 'text-[--text-primary]'
          )}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      {flashing && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ background: 'rgba(74,222,128,0.15)', pointerEvents: 'none' }}
        />
      )}
    </div>
  )
}
