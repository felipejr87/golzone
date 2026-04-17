import React from 'react'

interface StandingsProps {
  data: Array<{
    time: string
    jogos: number
    vitorias: number
    empates: number
    derrotas: number
    pontos: number
  }>
}

export const StandingsTable: React.FC<StandingsProps> = ({ data }) => {
  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-800">
          <tr className="text-gray-400">
            <th className="text-left p-3">Posição</th>
            <th className="text-left p-3">Time</th>
            <th className="text-center p-3">J</th>
            <th className="text-center p-3">V</th>
            <th className="text-center p-3">E</th>
            <th className="text-center p-3">D</th>
            <th className="text-center p-3">Pts</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="p-3 font-bold text-green-500">{i + 1}</td>
              <td className="p-3 font-semibold">{row.time}</td>
              <td className="text-center p-3">{row.jogos}</td>
              <td className="text-center p-3">{row.vitorias}</td>
              <td className="text-center p-3">{row.empates}</td>
              <td className="text-center p-3">{row.derrotas}</td>
              <td className="text-center p-3 font-bold text-amber-400">{row.pontos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}