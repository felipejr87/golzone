import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MOCK_DATA } from '../lib/mockData'

type MatchItem = {
  id: number
  status: string
  rodada: number
  data_hora: string | null
  local?: string | null
  link_video?: string | null
  championship_id: number
  mandante_id: number
  visitante_id: number
  mandante: { id: number; nome: string } | null
  visitante: { id: number; nome: string } | null
  championship: { nome: string } | null
  resultado: { gols_mandante: number; gols_visitante: number } | null
}

export default function Home() {
  const [hero, setHero]             = useState<MatchItem | null>(null)
  const [campeonatos, setCampeonatos] = useState<typeof MOCK_DATA.campeonatos>([])
  const [proximos, setProximos]     = useState<MatchItem[]>([])
  const [resultados, setResultados] = useState<MatchItem[]>([])
  const [artilharia, setArtilharia] = useState<typeof MOCK_DATA.artilharia>([])

  useEffect(() => {
    async function load() {
      try {
        const [liveRes, campsRes, nextRes, resultsRes] = await Promise.all([
          supabase.from('matches').select(`
            id, status, rodada, data_hora, local, link_video, championship_id, mandante_id, visitante_id,
            mandante:teams!mandante_id(id,nome),
            visitante:teams!visitante_id(id,nome),
            championship:championships(nome),
            resultado:match_results(gols_mandante,gols_visitante)
          `).eq('status', 'em_andamento').limit(1),
          supabase.from('championships').select('*').eq('status', 'ativo'),
          supabase.from('matches').select(`
            id, status, rodada, data_hora, local, link_video, championship_id, mandante_id, visitante_id,
            mandante:teams!mandante_id(id,nome),
            visitante:teams!visitante_id(id,nome),
            championship:championships(nome),
            resultado:match_results(gols_mandante,gols_visitante)
          `).eq('status', 'agendado').gte('data_hora', new Date().toISOString())
            .order('data_hora').limit(4),
          supabase.from('matches').select(`
            id, status, rodada, data_hora, local, link_video, championship_id, mandante_id, visitante_id,
            mandante:teams!mandante_id(id,nome),
            visitante:teams!visitante_id(id,nome),
            championship:championships(nome),
            resultado:match_results(gols_mandante,gols_visitante)
          `).eq('status', 'finalizado').order('id', { ascending: false }).limit(4),
        ])

        const liveMatch = liveRes.data?.[0] ?? null
        if (liveMatch) {
          setHero(liveMatch as unknown as MatchItem)
        } else if (nextRes.data?.[0]) {
          setHero(nextRes.data[0] as unknown as MatchItem)
        } else {
          setHero(MOCK_DATA.matches[4] as unknown as MatchItem)
        }

        setCampeonatos(campsRes.data?.length ? campsRes.data as typeof MOCK_DATA.campeonatos : MOCK_DATA.campeonatos)
        setProximos(nextRes.data?.length ? nextRes.data as unknown as MatchItem[] : MOCK_DATA.matches.filter(m => m.status === 'agendado').slice(0, 2) as unknown as MatchItem[])
        setResultados(resultsRes.data?.length ? resultsRes.data as unknown as MatchItem[] : MOCK_DATA.matches.filter(m => m.status === 'finalizado').slice(0, 4) as unknown as MatchItem[])
        setArtilharia(MOCK_DATA.artilharia)
      } catch {
        setHero(MOCK_DATA.matches[4] as unknown as MatchItem)
        setCampeonatos(MOCK_DATA.campeonatos)
        setProximos(MOCK_DATA.matches.filter(m => m.status === 'agendado').slice(0, 2) as unknown as MatchItem[])
        setResultados(MOCK_DATA.matches.filter(m => m.status === 'finalizado').slice(0, 4) as unknown as MatchItem[])
        setArtilharia(MOCK_DATA.artilharia)
      }
    }
    load()
  }, [])

  const isLive = hero?.status === 'em_andamento'

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A0506] via-[#0E0F15] to-[#060608] border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,35,42,0.08),transparent_60%)]" />
        <div className="relative px-4 py-10 md:py-16 text-center">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <span className="text-xs text-gray-500 uppercase tracking-widest">
              {hero?.championship?.nome ?? 'Divino App'}
            </span>
            {isLive && (
              <span className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 px-2 py-0.5 rounded-full badge-live">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />
                <span className="text-red-400 text-xs font-bold">AO VIVO</span>
              </span>
            )}
          </div>

          {hero ? (
            <>
              <div className="flex items-center justify-center gap-4 md:gap-12">
                <TeamDisplay team={hero.mandante} />
                <div className="text-center flex-shrink-0 px-2">
                  {(isLive || hero.status === 'finalizado') && hero.resultado ? (
                    <div className="font-display text-6xl md:text-8xl text-white tracking-wider glow-red">
                      {hero.resultado.gols_mandante}
                      <span className="text-gray-600 mx-2 md:mx-3">:</span>
                      {hero.resultado.gols_visitante}
                    </div>
                  ) : (
                    <div>
                      <div className="font-display text-3xl text-gray-400">VS</div>
                      {hero.data_hora && (
                        <div className="text-sm text-gray-500 mt-2">
                          {new Date(hero.data_hora).toLocaleString('pt-BR', {
                            weekday: 'short', day: '2-digit', month: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <TeamDisplay team={hero.visitante} />
              </div>

              <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
                <Link to={`/m/${hero.id}`}
                  className="px-5 py-2.5 bg-[#E8232A] text-white text-sm font-bold rounded-full hover:bg-[#B01B21] transition">
                  Ver detalhes
                </Link>
                {hero.link_video && (
                  <a href={hero.link_video} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-sm font-bold rounded-full hover:bg-white/15 transition">
                    <YtIcon /> Assistir no YouTube
                  </a>
                )}
              </div>
            </>
          ) : (
            <div>
              <div className="font-display text-5xl text-gradient mb-2">DIVINO APP</div>
              <p className="text-gray-500 text-sm">Futebol de base e várzea em tempo real</p>
            </div>
          )}
        </div>
      </div>

      {/* ── CAMPEONATOS ── */}
      <section className="px-4 py-6">
        <SectionTitle title="Campeonatos" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {campeonatos.map(c => (
            <Link key={c.id} to={`/c/${c.id}`}
              className="flex items-center justify-between p-4 bg-[#0E0F15] rounded-2xl card-hover">
              <div>
                <div className="font-bold text-white">{c.nome}</div>
                <div className="text-gray-500 text-xs mt-0.5">{c.categoria} · {c.temporada}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#E8232A]/20 text-[#E8232A] text-xs font-bold px-2 py-0.5 rounded-full">Ativo</span>
                <span className="text-gray-600">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PRÓXIMOS JOGOS ── */}
      {proximos.length > 0 && (
        <section className="px-4 py-6 border-t border-white/5">
          <SectionTitle title="Próximos Jogos" badge="📅" />
          <div className="space-y-2">
            {proximos.map(j => (
              <Link key={j.id} to={`/m/${j.id}`}
                className="flex items-center gap-3 p-4 bg-[#0E0F15] rounded-2xl card-hover">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-600 mb-1">{j.championship?.nome} · Rodada {j.rodada}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate flex-1">{j.mandante?.nome}</span>
                    <span className="bg-[#4B9FFF]/20 text-[#4B9FFF] text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                      {j.data_hora
                        ? new Date(j.data_hora).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                        : 'Em breve'}
                    </span>
                    <span className="font-bold text-white truncate flex-1 text-right">{j.visitante?.nome}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── ARTILHARIA ── */}
      {artilharia.length > 0 && (
        <section className="px-4 py-6 border-t border-white/5">
          <SectionTitle title="Artilharia" badge="⚽" />
          <div className="bg-[#0E0F15] rounded-2xl overflow-hidden">
            {artilharia.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                <span className={`font-display text-xl w-6 text-center ${i < 3 ? 'text-[#F5B800]' : 'text-gray-700'}`}>{i + 1}</span>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{a.player_nome}</p>
                  <p className="text-gray-600 text-xs">{a.time}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-display text-2xl text-[#00D68F]">{a.gols}</span>
                  <span className="text-gray-600 text-xs">gols</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ÚLTIMOS RESULTADOS ── */}
      <section className="px-4 py-6 border-t border-white/5">
        <SectionTitle title="Últimos Resultados" badge="📊" />
        <div className="space-y-2">
          {resultados.map(j => (
            <Link key={j.id} to={`/m/${j.id}`}
              className="flex items-center gap-3 p-4 bg-[#0E0F15] rounded-2xl card-hover">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-600 mb-1">{j.championship?.nome} · Rodada {j.rodada}</div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white truncate flex-1">{j.mandante?.nome}</span>
                  <span className="font-display text-2xl text-white flex-shrink-0 px-2">
                    {j.resultado?.gols_mandante ?? '—'} × {j.resultado?.gols_visitante ?? '—'}
                  </span>
                  <span className="font-bold text-white truncate flex-1 text-right">{j.visitante?.nome}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}

function TeamDisplay({ team }: { team: { id: number; nome: string } | null }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
        ⚽
      </div>
      <span className="font-bold text-white text-center text-sm md:text-base leading-tight max-w-[120px]">
        {team?.nome ?? '—'}
      </span>
    </div>
  )
}

function SectionTitle({ title, badge }: { title: string; badge?: string }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
      {badge && <span>{badge}</span>}
      {title}
    </h2>
  )
}

function YtIcon() {
  return (
    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  )
}
