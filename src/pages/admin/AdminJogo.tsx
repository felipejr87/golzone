import { useParams, Link } from 'react-router-dom'
import { db } from '../../lib/data'

export default function AdminJogo() {
  const { id } = useParams()
  const jogo = db.jogos.buscar(Number(id))
  if (!jogo) return <div style={{ padding:32, color:'var(--t-3)' }}>Jogo não encontrado.</div>

  const isDone = jogo.status === 'finalizado'
  const isLive = jogo.status === 'em_andamento'

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:16 }}>

      <div className="card" style={{ padding:20, marginBottom:16, textAlign:'center' }}>
        <div style={{ fontSize:11, color:'var(--t-3)', marginBottom:12 }}>
          {jogo.championship?.nome} · Rodada {jogo.rodada}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16 }}>
          <span style={{ fontWeight:700, color:'var(--t-1)', fontSize:14 }}>{jogo.mandante?.nome}</span>
          <span className="display" style={{ fontSize:32, color:'var(--t-1)' }}>
            {isDone || isLive
              ? `${jogo.resultado?.gols_mandante ?? 0} : ${jogo.resultado?.gols_visitante ?? 0}`
              : 'vs'
            }
          </span>
          <span style={{ fontWeight:700, color:'var(--t-1)', fontSize:14 }}>{jogo.visitante?.nome}</span>
        </div>
        <div style={{ fontSize:12, color:'var(--t-3)', marginTop:10 }}>
          {jogo.local}
          {jogo.data_hora && ` · ${new Date(jogo.data_hora).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}`}
        </div>
        {isLive && (
          <div style={{ marginTop:12 }}>
            <span className="badge badge-live"><span className="live-dot"/>AO VIVO</span>
          </div>
        )}
      </div>

      {!isDone && (
        <Link to={`/admin/narracao/${id}`} className="btn btn-primary btn-full btn-lg"
          style={{ marginBottom:12, borderRadius:'var(--r-lg)', display:'flex' }}>
          {isLive ? '🔴 Continuar narração' : '🎙️ Iniciar narração'}
        </Link>
      )}

      {isDone && (
        <div style={{
          background:'var(--bg-card)', border:'0.5px solid var(--b-1)',
          borderRadius:'var(--r-lg)', padding:16, marginBottom:12, textAlign:'center',
        }}>
          <div style={{ fontSize:12, color:'var(--t-3)', marginBottom:6 }}>Jogo encerrado</div>
          <Link to={`/admin/narracao/${id}`} style={{ fontSize:13, color:'var(--red)', textDecoration:'none' }}>
            Ver escalação e relatório →
          </Link>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <InfoRow label="Status" valor={jogo.status}/>
        <InfoRow label="Link YouTube" valor={jogo.link_video || 'Não cadastrado'}/>
        <InfoRow label="Árbitro" valor={jogo.sumula?.arbitro || '—'}/>
        <InfoRow label="Local" valor={jogo.local || '—'}/>
      </div>

      <div style={{ marginTop:16, display:'flex', gap:8 }}>
        <Link to={`/m/${id}`} target="_blank" className="btn btn-ghost btn-sm" style={{ flex:1 }}>
          Ver página pública
        </Link>
        <Link to={`/admin/jogos/${id}/sumula`} className="btn btn-ghost btn-sm" style={{ flex:1 }}>
          Editar súmula
        </Link>
      </div>
    </div>
  )
}

function InfoRow({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'12px 14px', background:'var(--bg-card)', borderRadius:'var(--r-md)',
      border:'0.5px solid var(--b-1)',
    }}>
      <span style={{ fontSize:13, color:'var(--t-2)' }}>{label}</span>
      <span style={{ fontSize:13, color:'var(--t-1)', fontWeight:500, maxWidth:'60%', textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{valor}</span>
    </div>
  )
}
