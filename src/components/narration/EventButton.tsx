import { cn } from '@/lib/utils'

type EventType =
  | 'gol'
  | 'assistencia'
  | 'falta'
  | 'cartao-amarelo'
  | 'cartao-vermelho'
  | 'impedimento'
  | 'substituicao'
  | 'finalizacao'

interface EventButtonProps {
  type: EventType
  onPress: () => void
  disabled?: boolean
  className?: string
}

const EVENT_CONFIG: Record<EventType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  'gol': {
    label: 'Gol',
    icon: <SoccerBallIcon />,
    color: '#4ADE80',
    bg: 'rgba(74,222,128,0.12)',
  },
  'assistencia': {
    label: 'Assistência',
    icon: <AssistIcon />,
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.12)',
  },
  'falta': {
    label: 'Falta',
    icon: <FaultIcon />,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
  'cartao-amarelo': {
    label: 'Amarelo',
    icon: <CardIcon color="#F59E0B" />,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
  'cartao-vermelho': {
    label: 'Vermelho',
    icon: <CardIcon color="#EF4444" />,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
  },
  'impedimento': {
    label: 'Impedimento',
    icon: <FlagIcon />,
    color: '#C084FC',
    bg: 'rgba(192,132,252,0.12)',
  },
  'substituicao': {
    label: 'Subs.',
    icon: <SubIcon />,
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
  },
  'finalizacao': {
    label: 'Chute',
    icon: <ShotIcon />,
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.12)',
  },
}

export function EventButton({ type, onPress, disabled, className }: EventButtonProps) {
  const cfg = EVENT_CONFIG[type]

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5',
        'min-w-[72px] min-h-[72px] rounded-xl border',
        'font-body text-[10px] font-bold uppercase tracking-wider',
        'active:scale-95 transition-transform duration-75',
        'disabled:opacity-40 disabled:pointer-events-none',
        className
      )}
      style={{
        background: cfg.bg,
        borderColor: `${cfg.color}33`,
        color: cfg.color,
      }}
    >
      <span className="w-6 h-6 flex items-center justify-center">{cfg.icon}</span>
      {cfg.label}
    </button>
  )
}

function SoccerBallIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.93V16c0-.55.45-1 1-1s1 .45 1 1v1.93c-.33.04-.66.07-1 .07s-.67-.03-1-.07zm4.96-1.27-1.07-1.07c-.37-.37-.37-.98 0-1.35l1.07-1.07C17.59 14.72 18 15.82 18 17c0 .25-.02.5-.04.73zM18 11c-.55 0-1-.45-1-1 0-1.18-.41-2.28-1.11-3.14l1.07-1.07c.51.44.96.95 1.31 1.52.38.64.66 1.36.8 2.12.07.37.1.76.1 1.15 0 .47-.48.85-.93.85-.01 0-.01 0 0 0l-.14-.43zm-9.93 3.59L9.14 13.5c.37-.37.37-.98 0-1.35l-1.07-1.07C7.41 12.28 7 13.38 7 14.56c0 .74.15 1.45.42 2.1l.65-.14zM6.04 11.73C6.02 11.5 6 11.25 6 11c0-.38.03-.77.1-1.15.14-.76.42-1.48.8-2.12.35-.57.8-1.08 1.31-1.52l1.07 1.07C8.41 8.72 8 9.82 8 11c0 .55-.45 1-1 1s-1-.45-1-1v-.07zm5-.77V9c0-.55.45-1 1-1s1 .45 1 1v1.96c.42.22.79.52 1.06.9L15.17 13c-.37.37-.37.98 0 1.35l.07.07c-.62.68-1.48 1.14-2.44 1.27V14c0-.18-.01-.36-.04-.54l-1.38-1.38c-.18.03-.36.04-.54.04-.57 0-1.09-.16-1.54-.44l-.96.96L7.5 13c.22-1.04.89-1.92 1.8-2.44V9c0-.55.45-1 1-1s1 .45 1 1v.96z"/>
    </svg>
  )
}

function AssistIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  )
}

function FaultIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="3"/>
      <path d="M8 21v-5c0-2.2 1.8-4 4-4s4 1.8 4 4v5"/>
    </svg>
  )
}

function CardIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill={color}>
      <rect x="1" y="1" width="16" height="20" rx="3" ry="3"/>
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
    </svg>
  )
}

function SubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>
    </svg>
  )
}

function ShotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  )
}
