export interface Organization {
  id: string
  slug: string
  name: string
  logo_url?: string
}

export interface Championship {
  id: string
  org_id: string
  nome: string
  categoria: string
  temporada: string
  status: 'ativo' | 'finalizado'
  criado_em: string
}

export interface Team {
  id: string
  org_id: string
  nome: string
  escudo_url?: string
}

export interface Player {
  id: string
  org_id: string
  nome: string
  apelido: string
  foto_url?: string
  numero?: number
  team_id: string
}

export interface Match {
  id: string
  championship_id: string
  mandante_id: string
  visitante_id: string
  data_hora: string
  status: 'agendado' | 'em_andamento' | 'finalizado'
  local?: string
  mandante?: Team
  visitante?: Team
}

export interface MatchResult {
  id: string
  match_id: string
  gols_mandante: number
  gols_visitante: number
}

export interface Award {
  id: string
  match_id: string
  player_id: string
  tipo: string
  criado_em: string
  player?: Player
}