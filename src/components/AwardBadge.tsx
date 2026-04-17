import React from 'react'

interface AwardBadgeProps {
  label: string
  emoji?: string
}

export const AwardBadge: React.FC<AwardBadgeProps> = ({ label, emoji = '⭐' }) => {
  return (
    <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-400 px-2 py-1 rounded text-xs font-bold">
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  )
}