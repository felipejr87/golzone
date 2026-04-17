import React from 'react'
import { Link } from 'react-router-dom'
import { Player } from '../types'

interface PlayerCardProps {
  player: Player
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  return (
    <Link to={`/p/${player.id}`}>
      <div className="border border-gray-800 rounded-lg bg-gray-900 p-4 text-center hover:border-green-500/50 transition-colors cursor-pointer">
        {player.foto_url ? (
          <img src={player.foto_url} alt={player.apelido} className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
            {player.apelido[0]}
          </div>
        )}
        <p className="font-semibold">{player.apelido}</p>
        <p className="text-xs text-gray-400">{player.nome}</p>
        {player.numero && <p className="text-xs text-green-500 font-bold mt-1"># {player.numero}</p>}
      </div>
    </Link>
  )
}