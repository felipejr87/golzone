import { useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getScoreColor, getScoreDashOffset } from '@/lib/scoreUtils'

const SIZE_MAP = { sm: 40, md: 56, lg: 72 } as const
type Size = keyof typeof SIZE_MAP

interface Props {
  score: number
  size?: Size
  className?: string
  animate?: boolean
}

export function RatingCircle({ score, size = 'md', className, animate: shouldAnimate = true }: Props) {
  const px = SIZE_MAP[size]
  const strokeWidth = size === 'lg' ? 3.5 : size === 'md' ? 3 : 2.5
  const r = (px - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  const color = getScoreColor(score)
  const isElite = score >= 9.0

  const dashOffset = useMotionValue(circumference)
  const targetOffset = getScoreDashOffset(score, circumference)

  const prevScore = useRef(score)

  useEffect(() => {
    if (!shouldAnimate) {
      dashOffset.set(targetOffset)
      return
    }
    const controls = animate(dashOffset, targetOffset, {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    })
    prevScore.current = score
    return () => controls.stop()
  }, [score, targetOffset, dashOffset, shouldAnimate])

  const fontSize = size === 'lg' ? 18 : size === 'md' ? 13 : 10

  return (
    <div
      className={cn('relative inline-flex items-center justify-center shrink-0', className)}
      style={{ width: px, height: px }}
    >
      {isElite && (
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 12px ${color}55`, borderRadius: '50%' }}
        />
      )}
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} className="-rotate-90">
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <span
        className="absolute font-body font-bold tabular-nums"
        style={{ fontSize, color, lineHeight: 1 }}
      >
        {score % 1 === 0 ? score.toFixed(0) : score.toFixed(1)}
      </span>
    </div>
  )
}
