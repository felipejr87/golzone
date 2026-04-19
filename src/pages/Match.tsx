import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../lib/data'
import { TeamBadge } from '../components/ui/TeamBadge'

type Aba = 'sumula' | 'notas' | 'info'

export default function Match() {
  const { id } = useParams()
  const match = db.jogos.buscar(Number(id))
  const [aba, setAba] = useState<Aba>('sumula')

  if (!match) return <NotFound msg="Jogo não encontrado." />

  const isLive = match.status === 'em_andamento'
  const isDone = match.status === 'finalizado'
  const melhor = match.notas?.find((n: any) => n.melhor_jogo)

  return (
    <div style={{ maxWidth:640, margin:'0 auto', paddingBottom:80 }}>

      {/* PLACAR HERO */}
      <div style={{
        background:'linear-gradient(160deg,#130204 0%,var(--bg-card) 60%)',
        borderBottom:'0.5px solid var(--b-1)',
        padding:'20px 16px 16px',
      }}>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <Link to={`/c/${match.championship_id}`} style={{ fontSize:12, color:'var(--t-3)', textDecoration:'none' }}>
            ← {match.championship?.nome} · Rodada {match.rodada}
          </Link>
          {isLive && <span className="badge badge-live" style={{ marginLeft:8 }}><span className="live-dot"/>AO VIVO</span>}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <TeamBadge nome={match.mandante?.nome||''} size={48}/>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--t-1)', textAlign:'center', lineHeight:1.3 }}>
              {match.mandante?.nome}
            </span>
          </div>

          <div style={{ textAlign:'center', padding:'0 4px' }}>
            {isDone || isLive ? (
              <div className="display score-lg">
                {match.resultado?.gols_mandante ?? 0}
                <span style={{ color:'var(--t-3)', margin:'0 8px' }}>:</span>
                {match.resultado?.gols_visitante ?? 0}
              </div>
            ) : (
              <div>
                <span style={{ fontSize:16, color:'var(--t-3)', fontWeight:500 }}>vs</span>
                {match.data_hora && (
                  <div style={{ fontSize:12, color:'var(--t-3)', marginTop:4 }}>
                    {new Date(match.data_hora).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}
                  </div>
                )}
              </div>
            )}
            {isDone && <div style={{ fontSize:11, color:'var(--t-3)', marginTop:4 }}>Encerrado</div>}
          </div>

          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <TeamBadge nome={match.visitante?.nome||''} size={48}/>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--t-1)', textAlign:'center', lineHeight:1.3 }}>
              {match.visitante?.nome}
            </span>
          </div>
        </div>

        <div style={{ display:'flex', gap:16, justifyContent:'center', marginTop:12 }}>
          {match.local && <span style={{ fontSize:11, color:'var(--t-3)' }}>📍 {match.local}</span>}
          {match.sumula?.arbitro && <span style={{ fontSize:11, color:'var(--t-3)' }}>⚖ {match.sumula.arbitro}</span>}
        </div>

        {match.link_video && (
          <div style={{ marginTop:14, textAlign:'center' }}>
            <a href={match.link_video} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
              ▶ Assistir narração
            </a>
          </div>
        )}
      </div>

      {/* Melhor do jogo */}
      {melhor && (
        <div style={{
          margin:'12px 16px 0',
          background:'linear-gradient(90deg,rgba(245,184,0,0.08),transparent)',
          border:'0.5px solid rgba(245,184,0,0.2)',
          borderRadius:'var(--r-lg)', padding:'12px 16px',
          display:'flex', alignItems:'center', gap:12,
        }}>
          <span style={{ fontSize:24 }}>🏆</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, color:'var(--yellow)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>
              Melhor do jogo · Divino TV
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--t-1)' }}>
              {(melhor.player as any)?.apelido || melhor.player?.nome}
            </div>
          </div>
          <div className="display" style={{ fontSize:32, color:'var(--yellow)' }}>{melhor.nota}</div>
        </div>
      )}

      {/* Abas */}
      <div style={{
        display:'flex', borderBottom:'0.5px solid var(--b-1)',
        padding:'0 16px', marginTop:12,
      }}>
        {([['sumula','Súmula'],['notas','Notas'],['info','Info']] as const).map(([k,l]) => (
          <button key={k} onClick={() => setAba(k)} style={{
            flex:1, padding:'12px 0', background:'none', border:'none',
            borderBottom: aba===k ? '2px solid var(--red)' : '2px solid transparent',
            color: aba===k ? 'var(--t-1)' : 'var(--t-2)',
            fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:'16px' }}>

        {aba==='sumula' && (
          <div>
            {match.gols?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <SectionLabel>Gols</SectionLabel>
                {match.gols.map((g: any) => (
                  <EventRow key={g.id} minuto={g.minuto} texto={g.jogador} sub={g.team?.nome}
                    badge={g.tipo!=='normal' ? (g.tipo==='penalti'?'P':'CG') : undefined}
                    cor="var(--green)" />
                ))}
              </div>
            )}
            {match.cartoes?.length > 0 && (
              <div>
                <SectionLabel>Cartões</SectionLabel>
                {match.cartoes.map((c: any) => (
                  <EventRow key={c.id} minuto={c.minuto} texto={c.jogador} sub={c.team?.nome}
                    badge={c.tipo==='amarelo'?'🟨':c.tipo==='vermelho'?'🟥':'🟨🟥'}
                    cor={c.tipo==='amarelo'?'var(--yellow)':'var(--red)'} />
                ))}
              </div>
            )}
            {!match.gols?.length && !match.cartoes?.length && (
              <EmptyMsg>Súmula ainda não disponível.</EmptyMsg>
            )}
          </div>
        )}

        {aba==='notas' && (
          <div>
            <p style={{ fontSize:12, color:'var(--t-3)', textAlign:'center', marginBottom:16 }}>
              Avaliações da narração Divino TV
            </p>
            {[match.mandante, match.visitante].map((time: any) => {
              const nt = match.notas?.filter((n: any) => n.team_id === time?.id) || []
              if (!nt.length && match.notas?.length) {
                if (time?.id !== match.mandante?.id) return null
                const todos = [...(match.notas || [])].sort((a: any, b: any) => b.nota - a.nota)
                return (
                  <div key="all">
                    {todos.map((n: any) => <PlayerRatingRow key={n.id} nota={n} />)}
                  </div>
                )
              }
              if (!nt.length) return null
              return (
                <div key={time.id} style={{ marginBottom:20 }}>
                  <SectionLabel>{time.nome}</SectionLabel>
                  {[...nt].sort((a: any, b: any) => b.nota - a.nota).map((n: any) => (
                    <PlayerRatingRow key={n.id} nota={n} />
                  ))}
                </div>
              )
            })}
            {!match.notas?.length && <EmptyMsg>Notas ainda não disponíveis.</EmptyMsg>}
          </div>
        )}

        {aba==='info' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {([
              ['Árbitro', match.sumula?.arbitro],
              ['Público', match.sumula?.publico?.toLocaleString('pt-BR')],
              ['Local', match.local],
            ] as const).filter(([,v]) => v).map(([k,v]) => (
              <div key={k} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'12px 14px', background:'var(--bg-card)', borderRadius:'var(--r-md)',
                border:'0.5px solid var(--b-1)',
              }}>
                <span style={{ fontSize:13, color:'var(--t-2)' }}>{k}</span>
                <span style={{ fontSize:13, color:'var(--t-1)', fontWeight:500 }}>{v}</span>
              </div>
            ))}
            {match.sumula?.observacoes && (
              <div style={{ padding:'14px', background:'var(--bg-card)', borderRadius:'var(--r-md)', border:'0.5px solid var(--b-1)' }}>
                <div style={{ fontSize:11, color:'var(--t-3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Observações</div>
                <p style={{ fontSize:13, color:'var(--t-2)', lineHeight:1.6 }}>{match.sumula.observacoes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize:11, color:'var(--t-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
      {children}
    </div>
  )
}

function EventRow({ minuto, texto, sub, badge, cor }: { minuto?: number; texto: string; sub?: string; badge?: string; cor?: string }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'10px 0',
      borderBottom:'0.5px solid var(--b-1)',
    }}>
      <span style={{ fontSize:12, color:cor||'var(--t-3)', fontWeight:700, width:28, flexShrink:0 }}>
        {minuto ? `${minuto}'` : '—'}
      </span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'var(--t-1)' }}>{texto}</div>
        {sub && <div style={{ fontSize:12, color:'var(--t-3)', marginTop:1 }}>{sub}</div>}
      </div>
      {badge && <span style={{ fontSize:13 }}>{badge}</span>}
    </div>
  )
}

function PlayerRatingRow({ nota }: { nota: any }) {
  const n = Number(nota.nota)
  const cor = n >= 8 ? 'var(--green)' : n >= 6 ? 'var(--yellow)' : 'var(--red)'
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
      background: nota.melhor_jogo ? 'rgba(245,184,0,0.05)' : 'var(--bg-card)',
      borderRadius:'var(--r-md)', border:`0.5px solid ${nota.melhor_jogo?'rgba(245,184,0,0.2)':'var(--b-1)'}`,
      marginBottom:6,
    }}>
      <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--bg-card-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'var(--t-2)', flexShrink:0 }}>
        {(nota.player?.apelido||nota.player?.nome||'?').slice(0,2).toUpperCase()}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'var(--t-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {nota.player?.apelido||nota.player?.nome}
        </div>
        {nota.melhor_jogo && <div style={{ fontSize:11, color:'var(--yellow)' }}>⭐ Melhor do jogo</div>}
      </div>
      <div className="rating-circle" style={{ width:40, height:40, borderColor:cor, color:cor, fontSize:15, flexShrink:0 }}>
        {nota.nota}
      </div>
    </div>
  )
}

function NotFound({ msg }: { msg: string }) {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200, color:'var(--t-3)' }}>{msg}</div>
}
function EmptyMsg({ children }: { children: string }) {
  return <div style={{ textAlign:'center', padding:'32px 0', color:'var(--t-3)', fontSize:13 }}>{children}</div>
}
