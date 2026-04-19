import { MOCK_DATA, mockJogadoresPorTime } from './mockData'

export const db = {
  jogos: {
    aoVivo: () => MOCK_DATA.matches.filter(m => m.status === 'em_andamento'),
    proximos: () =>
      MOCK_DATA.matches
        .filter(m => m.status === 'agendado')
        .sort((a, b) =>
          new Date(a.data_hora ?? 0).getTime() - new Date(b.data_hora ?? 0).getTime()
        ),
    recentes: () =>
      [...MOCK_DATA.matches.filter(m => m.status === 'finalizado')]
        .sort((a, b) =>
          new Date(b.data_hora ?? 0).getTime() - new Date(a.data_hora ?? 0).getTime()
        )
        .slice(0, 8),
    buscar: (id: number) => MOCK_DATA.matches.find(m => m.id === id) ?? null,
    listar: () => MOCK_DATA.matches,
  },
  campeonatos: {
    listar: () => MOCK_DATA.campeonatos,
    buscar: (id: number) => MOCK_DATA.campeonatos.find(c => c.id === id) ?? null,
  },
  times: {
    listar: () => MOCK_DATA.times,
    buscar: (id: number) => MOCK_DATA.times.find(t => t.id === id) ?? null,
  },
  jogadores: {
    listar: () => MOCK_DATA.jogadores,
    porTime: (teamId: number) => mockJogadoresPorTime(teamId),
  },
  mockJogadoresPorTime,
}
