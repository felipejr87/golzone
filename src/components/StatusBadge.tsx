import React from 'react'

interface StatusBadgeProps {
  status: 'ativo' | 'finalizado' | 'agendado' | 'em_andamento'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = {
    ativo: 'bg-green-500/20 text-green-500',
    finalizado: 'bg-gray-400/20 text-gray-400',
    agendado: 'bg-blue-500/20 text-blue-400',
    em_andamento: 'bg-orange-500/20 text-orange-400',
  }

  const labels = {
    ativo: 'Ativo',
    finalizado: 'Finalizado',
    agendado: 'Agendado',
    em_andamento: 'Em andamento',
  }

  return (
    <span className={`${colors[status]} px-2 py-1 rounded text-xs font-semibold`}>
      {labels[status]}
    </span>
  )
}