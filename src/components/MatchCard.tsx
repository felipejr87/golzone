import React from 'react'
import { Link } from 'react-router-dom'
import { Match, MatchResult } from '../types'

interface MatchCardProps {
  match: Match & { resultado?: MatchResult[] }
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const resultado = match.resultado?.[0]
  const finished = match.status === 'finalizado'

  return (
    <Link to={`/m/${match.id}`}>
      <div className="border border-gray-800 rounded-lg bg-gray-900 p-4 hover:border-green-500/50 transition-colors cursor-pointer">
        <div className="text-center py-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm flex-1 font-semibold truncate">{match.mandante?.nome}</span>
            {finished && resultado ? (
              <span className="font-bold text-lg">{resultado.gols_mandante} - {resultado.gols_visitante}</span>
            ) : (
              <span className="text-gz-text2 text-sm">vs</span>
            )}
            <span className="text-sm flex-1 font-semibold text-right truncate">{match.visitante?.nome}</span>
          </div>
          <span className="text-xs text-gz-text2">
            {new Date(match.data_hora).toLocaleDateString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </Link>
  )
}