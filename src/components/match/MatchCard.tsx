import { Link } from 'react-router-dom'
import { TeamBadge } from '../ui/TeamBadge'

interface Props { jogo: any; compact?: boolean }

export function MatchCard({ jogo, compact=false }: Props) {
  const isLive = jogo.status === 'em_andamento'
  const isDone = jogo.status === 'finalizado'
  const isSoon = jogo.status === 'agendado'

  const hora = jogo.data_hora
    ? new Date(jogo.data_hora).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
    : ''

  return (
    <Link to={`/m/${jogo.id}`} style={{ textDecoration:'none', display:'block' }}>
      <div className={`card card-active ${isLive ? 'card-live' : ''}`}
        style={{ padding: compact ? '12px 14px' : '14px 16px' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:11, color:'var(--t-3)', fontWeight:500 }}>
            {jogo.championship?.nome} · R{jogo.rodada}
          </span>
          {isLive && <span className="badge badge-live"><span className="live-dot"/>AO VIVO</span>}
          {isSoon && <span className="badge badge-soon">{hora}</span>}
          {isDone && <span style={{ fontSize:11, color:'var(--t-3)' }}>Encerrado</span>}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10 }}>
            <TeamBadge nome={jogo.mandante?.nome||''} escudo_url={jogo.mandante?.escudo_url} size={32}/>
            <span style={{ fontWeight:600, fontSize:14, color:'var(--t-1)', lineHeight:1.2 }}>
              {jogo.mandante?.nome}
            </span>
          </div>

          <div style={{ textAlign:'center', flexShrink:0, minWidth:60 }}>
            {isDone || isLive ? (
              <span className="display" style={{ fontSize:26, color:'var(--t-1)' }}>
                {jogo.resultado?.gols_mandante ?? 0}
                <span style={{ color:'var(--t-3)', margin:'0 4px' }}>:</span>
                {jogo.resultado?.gols_visitante ?? 0}
              </span>
            ) : (
              <span style={{ fontSize:13, color:'var(--t-3)', fontWeight:500 }}>vs</span>
            )}
          </div>

          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10, justifyContent:'flex-end', flexDirection:'row-reverse' }}>
            <TeamBadge nome={jogo.visitante?.nome||''} escudo_url={jogo.visitante?.escudo_url} size={32}/>
            <span style={{ fontWeight:600, fontSize:14, color:'var(--t-1)', lineHeight:1.2, textAlign:'right' }}>
              {jogo.visitante?.nome}
            </span>
          </div>
        </div>

        {jogo.link_video && isLive && (
          <div style={{ marginTop:10, paddingTop:10, borderTop:'0.5px solid var(--b-1)' }}>
            <a href={jogo.link_video} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display:'inline-flex', alignItems:'center', gap:6,
                fontSize:12, color:'var(--red)', fontWeight:600, textDecoration:'none',
              }}>
              <YouTubeIcon size={14}/> Assistir narração ao vivo
            </a>
          </div>
        )}
      </div>
    </Link>
  )
}

function YouTubeIcon({ size=16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  )
}
