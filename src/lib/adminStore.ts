import { MOCK_DATA } from './mockData'

export type Campeonato = {
  id: number; nome: string; categoria: string
  temporada: number; status: 'ativo' | 'encerrado'
  modalidade: 'campo' | 'salão' | 'society'
}

export type Time = {
  id: number; nome: string; cidade: string; campeonato_id: number | null
}

export type Jogador = {
  id: number; nome: string; apelido: string
  posicao: 'goleiro' | 'zagueiro' | 'lateral' | 'volante' | 'meia' | 'atacante'
  time_id: number | null
}

export type Jogo = {
  id: number; campeonato_id: number; mandante_id: number; visitante_id: number
  rodada: number; data_hora: string; local: string
  status: 'agendado' | 'em_andamento' | 'finalizado'
}

const K = { camps: 'adm_c', times: 'adm_t', jogs: 'adm_j', jogos: 'adm_jo', seeded: 'adm_seed' }

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] }
}
function save<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)) }
function nextId(items: { id: number }[]) { return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1 }

function seed() {
  if (localStorage.getItem(K.seeded)) return
  save<Campeonato>(K.camps, MOCK_DATA.campeonatos.map(c => ({
    id: c.id, nome: c.nome, categoria: c.categoria,
    temporada: c.temporada, status: c.status as 'ativo',
    modalidade: c.modalidade as 'campo',
  })))
  save<Time>(K.times, MOCK_DATA.times.map(t => ({ id: t.id, nome: t.nome, cidade: t.cidade, campeonato_id: null })))
  save<Jogador>(K.jogs, MOCK_DATA.jogadores.map(j => {
    const time = MOCK_DATA.times.find(t => t.nome === j.time)
    return { id: j.id, nome: j.nome, apelido: j.apelido, posicao: j.posicao as Jogador['posicao'], time_id: time?.id ?? null }
  }))
  save<Jogo>(K.jogos, MOCK_DATA.matches.map(m => ({
    id: m.id, campeonato_id: m.championship_id, mandante_id: m.mandante_id, visitante_id: m.visitante_id,
    rodada: m.rodada, data_hora: m.data_hora ?? '', local: m.local ?? '', status: m.status as Jogo['status'],
  })))
  localStorage.setItem(K.seeded, '1')
}

function makeCrud<T extends { id: number }>(key: string) {
  return {
    listar: (): T[] => { seed(); return load<T>(key) },
    buscar: (id: number): T | null => { seed(); return load<T>(key).find(x => x.id === id) ?? null },
    salvar: (item: Omit<T, 'id'> & { id?: number }): T => {
      seed()
      const all = load<T>(key)
      if (item.id) {
        const idx = all.findIndex(x => x.id === (item as T).id)
        const updated = item as T
        if (idx >= 0) all[idx] = updated; else all.push(updated)
        save(key, all); return updated
      }
      const novo = { ...item, id: nextId(all) } as T
      all.push(novo); save(key, all); return novo
    },
    deletar: (id: number) => { seed(); save(key, load<T>(key).filter(x => x.id !== id)) },
  }
}

export const adminStore = {
  campeonatos: makeCrud<Campeonato>(K.camps),
  times:       makeCrud<Time>(K.times),
  jogadores:   { ...makeCrud<Jogador>(K.jogs), porTime: (tid: number) => { seed(); return load<Jogador>(K.jogs).filter(j => j.time_id === tid) } },
  jogos:       makeCrud<Jogo>(K.jogos),
}
