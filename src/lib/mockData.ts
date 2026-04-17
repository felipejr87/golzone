// src/lib/mockData.ts
// Dados de demonstração para validação com Divino TV

export const MOCK_DATA = {

  campeonatos: [
    { id: 1, nome: 'Copa Divino TV 2026', categoria: 'Amador', temporada: 2026, status: 'ativo', org_id: '1' },
    { id: 2, nome: 'Liga Sub-20 ABC 2026', categoria: 'Sub-20', temporada: 2026, status: 'ativo', org_id: '1' },
  ],

  times: [
    { id: 1, nome: 'Flamengo Várzea',   cidade: 'Santo André' },
    { id: 2, nome: 'Corinthians Base',  cidade: 'São Paulo' },
    { id: 3, nome: 'Santos FC Amador',  cidade: 'Santos' },
    { id: 4, nome: 'Palmeiras Jovem',   cidade: 'São Paulo' },
    { id: 5, nome: 'EC Mauá FC',        cidade: 'Mauá' },
    { id: 6, nome: 'União Diadema',     cidade: 'Diadema' },
  ],

  jogadores: [
    { id: 1, nome: 'Carlos Eduardo Silva', apelido: 'Carlão',      posicao: 'atacante', time: 'Flamengo Várzea' },
    { id: 2, nome: 'João Pedro Ramos',     apelido: 'Pedrinho',    posicao: 'meia',     time: 'Flamengo Várzea' },
    { id: 3, nome: 'Rafael Costa Lima',    apelido: 'Rafa',        posicao: 'goleiro',  time: 'Flamengo Várzea' },
    { id: 4, nome: 'Bruno Oliveira',       apelido: 'Brunão',      posicao: 'zagueiro', time: 'Flamengo Várzea' },
    { id: 5, nome: 'Lucas Ferreira',       apelido: 'Luca',        posicao: 'lateral',  time: 'Flamengo Várzea' },
    { id: 6, nome: 'André Mendes',         apelido: 'Andrezinho',  posicao: 'volante',  time: 'Corinthians Base' },
    { id: 7, nome: 'Diego Souza',          apelido: 'Diegão',      posicao: 'atacante', time: 'Corinthians Base' },
    { id: 8, nome: 'Mateus Alves',         apelido: 'Mateus',      posicao: 'meia',     time: 'Palmeiras Jovem' },
  ],

  matches: [
    {
      id: 1, rodada: 1, status: 'finalizado',
      data_hora: new Date(Date.now() - 10*24*3600000).toISOString(),
      local: 'Campo do Ibirapuera',
      championship_id: 1,
      mandante_id: 1, visitante_id: 2,
      mandante: { id: 1, nome: 'Flamengo Várzea' },
      visitante: { id: 2, nome: 'Corinthians Base' },
      championship: { nome: 'Copa Divino TV 2026' },
      resultado: { gols_mandante: 3, gols_visitante: 1 },
      gols: [
        { id:1, jogador:'Carlão',    minuto:14, tipo:'normal',  team: { nome:'Flamengo Várzea' } },
        { id:2, jogador:'Pedrinho',  minuto:38, tipo:'normal',  team: { nome:'Flamengo Várzea' } },
        { id:3, jogador:'Diegão',    minuto:55, tipo:'normal',  team: { nome:'Corinthians Base' } },
        { id:4, jogador:'Carlão',    minuto:72, tipo:'penalti', team: { nome:'Flamengo Várzea' } },
      ],
      cartoes: [
        { id:1, jogador:'Andrezinho', minuto:34, tipo:'amarelo',        team: { nome:'Corinthians Base' } },
        { id:2, jogador:'Ricardinho', minuto:67, tipo:'amarelo',        team: { nome:'Corinthians Base' } },
      ],
      notas: [
        { id:1, player: { nome:'Carlão' },    nota:9.5, melhor_jogo:true  },
        { id:2, player: { nome:'Pedrinho' },  nota:7.5, melhor_jogo:false },
        { id:3, player: { nome:'Rafa' },      nota:7.0, melhor_jogo:false },
        { id:4, player: { nome:'Diegão' },    nota:6.5, melhor_jogo:false },
      ],
      sumula: { arbitro:'José Santos', publico:320, observacoes:'Partida disputada. Público animado. Carlão decisivo.' },
      link_video: null as string | null,
    },
    {
      id: 2, rodada: 1, status: 'finalizado',
      data_hora: new Date(Date.now() - 10*24*3600000).toISOString(),
      local: 'Arena Várzea Norte',
      championship_id: 1,
      mandante_id: 3, visitante_id: 4,
      mandante: { id: 3, nome: 'Santos FC Amador' },
      visitante: { id: 4, nome: 'Palmeiras Jovem' },
      championship: { nome: 'Copa Divino TV 2026' },
      resultado: { gols_mandante: 0, gols_visitante: 2 },
      gols: [
        { id:5, jogador:'Carlão',  minuto:29, tipo:'normal', team: { nome:'Palmeiras Jovem' } },
        { id:6, jogador:'Mateus',  minuto:61, tipo:'normal', team: { nome:'Palmeiras Jovem' } },
      ],
      cartoes: [
        { id:3, jogador:'Thiagão', minuto:50, tipo:'vermelho', team: { nome:'Santos FC Amador' } },
      ],
      notas: [
        { id:5, player: { nome:'Mateus' }, nota:8.0, melhor_jogo:true  },
        { id:6, player: { nome:'Carlão' }, nota:7.5, melhor_jogo:false },
      ],
      sumula: { arbitro:'Carlos Moreira', publico:210, observacoes:'Santos jogou com 10 desde os 50 minutos.' },
      link_video: null as string | null,
    },
    {
      id: 3, rodada: 2, status: 'finalizado',
      data_hora: new Date(Date.now() - 3*24*3600000).toISOString(),
      local: 'Campo do Ibirapuera',
      championship_id: 1,
      mandante_id: 2, visitante_id: 3,
      mandante: { id: 2, nome: 'Corinthians Base' },
      visitante: { id: 3, nome: 'Santos FC Amador' },
      championship: { nome: 'Copa Divino TV 2026' },
      resultado: { gols_mandante: 1, gols_visitante: 1 },
      gols: [
        { id:7, jogador:'Diegão', minuto:43, tipo:'normal', team: { nome:'Corinthians Base' } },
        { id:8, jogador:'Gabi',   minuto:78, tipo:'normal', team: { nome:'Santos FC Amador' } },
      ],
      cartoes: [
        { id:4, jogador:'Diegão', minuto:89, tipo:'amarelo_vermelho', team: { nome:'Corinthians Base' } },
      ],
      notas: [] as { id:number, player:{nome:string}, nota:number, melhor_jogo:boolean }[],
      sumula: null as { arbitro:string, publico:number, observacoes:string } | null,
      link_video: null as string | null,
    },
    {
      id: 4, rodada: 2, status: 'finalizado',
      data_hora: new Date(Date.now() - 3*24*3600000).toISOString(),
      local: 'Arena Várzea Norte',
      championship_id: 1,
      mandante_id: 4, visitante_id: 1,
      mandante: { id: 4, nome: 'Palmeiras Jovem' },
      visitante: { id: 1, nome: 'Flamengo Várzea' },
      championship: { nome: 'Copa Divino TV 2026' },
      resultado: { gols_mandante: 2, gols_visitante: 0 },
      gols: [
        { id:9,  jogador:'Mateus', minuto:11, tipo:'normal',  team: { nome:'Palmeiras Jovem' } },
        { id:10, jogador:'Carlão', minuto:88, tipo:'contra',  team: { nome:'Flamengo Várzea' } },
      ],
      cartoes: [
        { id:5, jogador:'Brunão', minuto:23, tipo:'amarelo', team: { nome:'Flamengo Várzea' } },
      ],
      notas: [
        { id:7, player: { nome:'Mateus' }, nota:8.5, melhor_jogo:true  },
        { id:8, player: { nome:'Carlão' }, nota:6.0, melhor_jogo:false },
      ],
      sumula: { arbitro:'Carlos Moreira', publico:180, observacoes:'Jogo truncado na primeira etapa. Boa atuação do Palmeiras.' },
      link_video: null as string | null,
    },
    {
      id: 5, rodada: 3, status: 'agendado',
      data_hora: new Date(Date.now() + 4*24*3600000).toISOString(),
      local: 'Campo do Ibirapuera',
      championship_id: 1,
      mandante_id: 1, visitante_id: 3,
      mandante: { id: 1, nome: 'Flamengo Várzea' },
      visitante: { id: 3, nome: 'Santos FC Amador' },
      championship: { nome: 'Copa Divino TV 2026' },
      resultado: null as { gols_mandante:number, gols_visitante:number } | null,
      gols: [] as { id:number, jogador:string, minuto:number, tipo:string, team:{nome:string} }[],
      cartoes: [] as { id:number, jogador:string, minuto:number, tipo:string, team:{nome:string} }[],
      notas: [] as { id:number, player:{nome:string}, nota:number, melhor_jogo:boolean }[],
      sumula: null as { arbitro:string, publico:number, observacoes:string } | null,
      link_video: 'https://youtube.com/watch?v=dQw4w9WgXcQ' as string | null,
    },
    {
      id: 6, rodada: 3, status: 'agendado',
      data_hora: new Date(Date.now() + 4*24*3600000).toISOString(),
      local: 'Arena Várzea Norte',
      championship_id: 1,
      mandante_id: 2, visitante_id: 4,
      mandante: { id: 2, nome: 'Corinthians Base' },
      visitante: { id: 4, nome: 'Palmeiras Jovem' },
      championship: { nome: 'Copa Divino TV 2026' },
      resultado: null as { gols_mandante:number, gols_visitante:number } | null,
      gols: [] as { id:number, jogador:string, minuto:number, tipo:string, team:{nome:string} }[],
      cartoes: [] as { id:number, jogador:string, minuto:number, tipo:string, team:{nome:string} }[],
      notas: [] as { id:number, player:{nome:string}, nota:number, melhor_jogo:boolean }[],
      sumula: null as { arbitro:string, publico:number, observacoes:string } | null,
      link_video: null as string | null,
    },
    {
      id: 7, rodada: 1, status: 'finalizado',
      data_hora: new Date(Date.now() - 7*24*3600000).toISOString(),
      local: 'Estádio Municipal Mauá',
      championship_id: 2,
      mandante_id: 5, visitante_id: 6,
      mandante: { id: 5, nome: 'EC Mauá FC' },
      visitante: { id: 6, nome: 'União Diadema' },
      championship: { nome: 'Liga Sub-20 ABC 2026' },
      resultado: { gols_mandante: 2, gols_visitante: 1 },
      gols: [
        { id:11, jogador:'Gabriel Costa', minuto:22, tipo:'normal', team: { nome:'EC Mauá FC' } },
        { id:12, jogador:'Felipe Neto',   minuto:55, tipo:'normal', team: { nome:'EC Mauá FC' } },
        { id:13, jogador:'Marcos Vini',   minuto:80, tipo:'normal', team: { nome:'União Diadema' } },
      ],
      cartoes: [] as { id:number, jogador:string, minuto:number, tipo:string, team:{nome:string} }[],
      notas: [
        { id:9,  player: { nome:'Gabriel Costa' }, nota:8.0, melhor_jogo:true  },
        { id:10, player: { nome:'Felipe Neto' },   nota:7.5, melhor_jogo:false },
      ],
      sumula: { arbitro:'Paulo Lima', publico:140, observacoes:'Boa partida entre as equipes jovens.' },
      link_video: null as string | null,
    },
    {
      id: 8, rodada: 2, status: 'agendado',
      data_hora: new Date(Date.now() + 6*24*3600000).toISOString(),
      local: 'Arena Sub-20 ABC',
      championship_id: 2,
      mandante_id: 4, visitante_id: 5,
      mandante: { id: 4, nome: 'Palmeiras Jovem' },
      visitante: { id: 5, nome: 'EC Mauá FC' },
      championship: { nome: 'Liga Sub-20 ABC 2026' },
      resultado: null as { gols_mandante:number, gols_visitante:number } | null,
      gols: [] as { id:number, jogador:string, minuto:number, tipo:string, team:{nome:string} }[],
      cartoes: [] as { id:number, jogador:string, minuto:number, tipo:string, team:{nome:string} }[],
      notas: [] as { id:number, player:{nome:string}, nota:number, melhor_jogo:boolean }[],
      sumula: null as { arbitro:string, publico:number, observacoes:string } | null,
      link_video: null as string | null,
    },
  ],

  classificacao: {
    1: [
      { team_id:4, team_nome:'Palmeiras Jovem',   escudo_url:null, jogos:2, vitorias:2, empates:0, derrotas:0, gols_pro:4, gols_contra:0, saldo:4,  pontos:6 },
      { team_id:1, team_nome:'Flamengo Várzea',   escudo_url:null, jogos:2, vitorias:1, empates:0, derrotas:1, gols_pro:3, gols_contra:3, saldo:0,  pontos:3 },
      { team_id:2, team_nome:'Corinthians Base',  escudo_url:null, jogos:2, vitorias:0, empates:1, derrotas:1, gols_pro:2, gols_contra:4, saldo:-2, pontos:1 },
      { team_id:3, team_nome:'Santos FC Amador',  escudo_url:null, jogos:2, vitorias:0, empates:1, derrotas:1, gols_pro:1, gols_contra:3, saldo:-2, pontos:1 },
    ],
    2: [
      { team_id:5, team_nome:'EC Mauá FC',       escudo_url:null, jogos:1, vitorias:1, empates:0, derrotas:0, gols_pro:2, gols_contra:1, saldo:1,  pontos:3 },
      { team_id:3, team_nome:'Santos FC Amador', escudo_url:null, jogos:1, vitorias:0, empates:1, derrotas:0, gols_pro:0, gols_contra:0, saldo:0,  pontos:1 },
      { team_id:4, team_nome:'Palmeiras Jovem',  escudo_url:null, jogos:1, vitorias:0, empates:1, derrotas:0, gols_pro:0, gols_contra:0, saldo:0,  pontos:1 },
      { team_id:6, team_nome:'União Diadema',    escudo_url:null, jogos:1, vitorias:0, empates:0, derrotas:1, gols_pro:1, gols_contra:2, saldo:-1, pontos:0 },
    ]
  } as Record<number, { team_id:number, team_nome:string, escudo_url:null, jogos:number, vitorias:number, empates:number, derrotas:number, gols_pro:number, gols_contra:number, saldo:number, pontos:number }[]>,

  artilharia: [
    { player_nome:'Carlão',        time:'Flamengo Várzea',  gols:3 },
    { player_nome:'Mateus',        time:'Palmeiras Jovem',  gols:2 },
    { player_nome:'Gabriel Costa', time:'EC Mauá FC',       gols:2 },
    { player_nome:'Diegão',        time:'Corinthians Base', gols:1 },
  ],

  premiacoes: [
    // ── Semana ──────────────────────────────────────────────────────────
    { id:1,  periodo:'semana', tipo:'melhor_jogo', referencia:'Rodada 3 · Copa DTV',    player_nome:'Mateus',        time_nome:'Palmeiras Jovem',  championship_nome:'Copa Divino TV 2026'   },
    { id:2,  periodo:'semana', tipo:'artilheiro',  referencia:'Semana 15/abr',           player_nome:'Carlão',        time_nome:'Flamengo Várzea',  championship_nome:'Copa Divino TV 2026'   },
    // ── Mês ─────────────────────────────────────────────────────────────
    { id:3,  periodo:'mes',    tipo:'melhor_jogo', referencia:'Rodada 1 · Copa DTV',    player_nome:'Carlão',        time_nome:'Flamengo Várzea',  championship_nome:'Copa Divino TV 2026'   },
    { id:4,  periodo:'mes',    tipo:'melhor_jogo', referencia:'Rodada 2 · Copa DTV',    player_nome:'Mateus',        time_nome:'Palmeiras Jovem',  championship_nome:'Copa Divino TV 2026'   },
    { id:5,  periodo:'mes',    tipo:'melhor_jogo', referencia:'Rodada 1 · Sub-20',      player_nome:'Gabriel Costa', time_nome:'EC Mauá FC',       championship_nome:'Liga Sub-20 ABC 2026' },
    { id:6,  periodo:'mes',    tipo:'melhor_mes',  referencia:'Abril 2026',              player_nome:'Carlão',        time_nome:'Flamengo Várzea',  championship_nome:'Copa Divino TV 2026'   },
    { id:7,  periodo:'mes',    tipo:'artilheiro',  referencia:'Abril 2026',              player_nome:'Carlão',        time_nome:'Flamengo Várzea',  championship_nome:'Copa Divino TV 2026'   },
    { id:8,  periodo:'mes',    tipo:'fair_play',   referencia:'Abril 2026',              player_nome:'Gabriel Costa', time_nome:'EC Mauá FC',       championship_nome:'Liga Sub-20 ABC 2026' },
    // ── Ano ─────────────────────────────────────────────────────────────
    { id:9,  periodo:'ano',    tipo:'melhor_jogo', referencia:'Rodada 1 · Copa DTV',    player_nome:'Carlão',        time_nome:'Flamengo Várzea',  championship_nome:'Copa Divino TV 2026'   },
    { id:10, periodo:'ano',    tipo:'melhor_jogo', referencia:'Rodada 1 · Sub-20',      player_nome:'Gabriel Costa', time_nome:'EC Mauá FC',       championship_nome:'Liga Sub-20 ABC 2026' },
    { id:11, periodo:'ano',    tipo:'melhor_mes',  referencia:'Março 2026',              player_nome:'Diegão',        time_nome:'Corinthians Base', championship_nome:'Copa Divino TV 2026'   },
    { id:12, periodo:'ano',    tipo:'melhor_mes',  referencia:'Abril 2026',              player_nome:'Carlão',        time_nome:'Flamengo Várzea',  championship_nome:'Copa Divino TV 2026'   },
    { id:13, periodo:'ano',    tipo:'melhor_ano',  referencia:'2025',                    player_nome:'Mateus',        time_nome:'Palmeiras Jovem',  championship_nome:'Copa Divino TV 2026'   },
    { id:14, periodo:'ano',    tipo:'artilheiro',  referencia:'2026',                    player_nome:'Carlão',        time_nome:'Flamengo Várzea',  championship_nome:'Copa Divino TV 2026'   },
    { id:15, periodo:'ano',    tipo:'fair_play',   referencia:'2026',                    player_nome:'Gabriel Costa', time_nome:'EC Mauá FC',       championship_nome:'Liga Sub-20 ABC 2026' },
  ]
}

export function getMock<T>(key: keyof typeof MOCK_DATA): T {
  return MOCK_DATA[key] as T
}
