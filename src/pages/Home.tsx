import { Link } from 'react-router-dom'
import { db } from '../lib/data'
import { MatchCard } from '../components/match/MatchCard'
import { TeamBadge } from '../components/ui/TeamBadge'

export default function Home() {
  const aoVivo   = db.jogos.aoVivo()
  const proximos = db.jogos.proximos()
  const recentes = db.jogos.recentes()
  const camps    = db.campeonatos.listar().filter(c => c.status === 'ativo')

  return (
    <div style={{ maxWidth:640, margin:'0 auto', paddingBottom:80 }}>

      {(aoVivo[0] || proximos[0]) && (
        <HeroJogo jogo={aoVivo[0] || proximos[0]} />
      )}

      {aoVivo.length > 1 && (
        <Section title="Ao vivo agora" live>
          {aoVivo.slice(1).map(j => <MatchCard key={j.id} jogo={j} compact />)}
        </Section>
      )}

      {proximos.length > 0 && (
        <Section title="Próximos jogos">
          {proximos.map(j => <MatchCard key={j.id} jogo={j} compact />)}
        </Section>
      )}

      <Section title="Campeonatos">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {camps.map(c => (
            <Link key={c.id} to={`/c/${c.id}`} style={{ textDecoration:'none' }}>
              <div className="card card-active" style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--t-1)', marginBottom:4 }}>{c.nome}</div>
                <div style={{ fontSize:12, color:'var(--t-3)' }}>{c.categoria} · {c.temporada}</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {recentes.length > 0 && (
        <Section title="Últimos resultados">
          {recentes.map(j => <MatchCard key={j.id} jogo={j} compact />)}
        </Section>
      )}
    </div>
  )
}

function HeroJogo({ jogo }: { jogo: any }) {
  const isLive = jogo.status === 'em_andamento'
  return (
    <div style={{
      background: 'linear-gradient(160deg,#130204 0%,var(--bg-card) 55%)',
      borderBottom: '0.5px solid var(--b-1)',
      padding: '24px 20px 20px',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:20 }}>
        <span style={{ fontSize:12, color:'var(--t-3)', fontWeight:500 }}>
          {jogo.championship?.nome} · Rodada {jogo.rodada}
        </span>
        {isLive && <span className="badge badge-live"><span className="live-dot"/>AO VIVO</span>}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16 }}>
        <TeamBlock time={jogo.mandante} />
        <div style={{ textAlign:'center', padding:'0 8px' }}>
          {jogo.resultado ? (
            <div className="display score-xl">
              {jogo.resultado.gols_mandante}
              <span style={{ color:'var(--t-3)', margin:'0 6px' }}>:</span>
              {jogo.resultado.gols_visitante}
            </div>
          ) : (
            <div>
              <div style={{ fontSize:18, color:'var(--t-3)', fontWeight:500 }}>vs</div>
              {jogo.data_hora && (
                <div style={{ fontSize:13, color:'var(--t-3)', marginTop:4 }}>
                  {new Date(jogo.data_hora).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'})}
                  {' · '}
                  {new Date(jogo.data_hora).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
                </div>
              )}
            </div>
          )}
        </div>
        <TeamBlock time={jogo.visitante} />
      </div>

      <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:20 }}>
        <Link to={`/m/${jogo.id}`} className="btn btn-primary btn-sm">Ver detalhes</Link>
        {jogo.link_video && (
          <a href={jogo.link_video} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
            Assistir narração
          </a>
        )}
      </div>
    </div>
  )
}

function TeamBlock({ time }: { time: any }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <TeamBadge nome={time?.nome||''} escudo_url={time?.escudo_url} size={52}/>
      <span style={{ fontSize:14, fontWeight:600, color:'var(--t-1)', textAlign:'center', lineHeight:1.2 }}>
        {time?.nome}
      </span>
    </div>
  )
}

function Section({ title, live, children }: { title:string; live?:boolean; children:React.ReactNode }) {
  return (
    <div style={{ padding:'20px 16px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--t-2)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
          {title}
        </span>
        {live && <span className="live-dot"/>}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{children}</div>
    </div>
  )
}
