import { useMemo } from 'react'

const COLORS = [
  '#E8232A','#E8652A','#2A8CE8','#2AE865',
  '#E82A8C','#8C2AE8','#E8C32A','#2AE8C3'
]

function hashColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function initials(nome: string) {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

interface Props {
  nome: string
  escudo_url?: string | null
  size?: number
  className?: string
}

export function TeamBadge({ nome, escudo_url, size = 48, className = '' }: Props) {
  const cor = useMemo(() => hashColor(nome), [nome])
  const abv = useMemo(() => initials(nome), [nome])

  if (escudo_url) {
    return (
      <img
        src={escudo_url}
        alt={nome}
        width={size}
        height={size}
        className={`object-contain rounded-full ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `${cor}22`,
        border: `1.5px solid ${cor}55`,
        color: cor,
        fontSize: size * 0.3,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: '0.04em',
      }}
    >
      {abv}
    </div>
  )
}
