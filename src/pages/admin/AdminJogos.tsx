import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminStore, type Jogo, type Campeonato, type Time } from '../../lib/adminStore'

const BLANK: Omit<Jogo, 'id'> = { campeonato_id: 0, mandante_id: 0, visitante_id: 0, rodada: 1, data_hora: '', local: '', status: 'agendado' }

export default function AdminJogos() {
  const [jogos, setJogos]   = useState<Jogo[]>([])
  const [camps, setCamps]   = useState<Campeonato[]>([])
  const [times, setTimes]   = useState<Time[]>([])
  const [form, setForm]     = useState<Omit<Jogo, 'id'> & { id?: number }>(BLANK)
  const [aberto, setAberto] = useState(false)
  const [filtro, setFiltro] = useState(0)

  function carregar() {
    setJogos(adminStore.jogos.listar())
    setCamps(adminStore.campeonatos.listar())
    setTimes(adminStore.times.listar())
  }
  useEffect(carregar, [])

  function abrir(j?: Jogo) { setForm(j ? { ...j } : { ...BLANK }); setAberto(true) }

  function salvar() {
    if (!form.mandante_id || !form.visitante_id || form.mandante_id === form.visitante_id) return
    adminStore.jogos.salvar(form); carregar(); setAberto(false)
  }

  function deletar(id: number) {
    if (!confirm('Remover jogo?')) return
    adminStore.jogos.deletar(id); carregar()
  }

  function nomeTime(id: number) { return times.find(t => t.id === id)?.nome ?? `Time #${id}` }
  function nomeCamp(id: number) { return camps.find(c => c.id === id)?.nome ?? '' }

  const lista = filtro ? jogos.filter(j => j.campeonato_id === filtro) : jogos
  const sorted = [...lista].sort((a, b) => {
    const ord = { em_andamento: 0, agendado: 1, finalizado: 2 }
    return (ord[a.status] ?? 9) - (ord[b.status] ?? 9)
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t-1)', margin: 0 }}>Jogos</h1>
        <button onClick={() => abrir()} style={btnPrimary}>+ Novo</button>
      </div>

      <select value={filtro} onChange={e => setFiltro(Number(e.target.value))} style={{ ...inp, marginBottom: 16 }}>
        <option value={0}>Todos os campeonatos</option>
        {camps.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.length === 0 && <p style={{ textAlign: 'center', color: 'var(--t-3)', padding: '40px 0', fontSize: 13 }}>Nenhum jogo cadastrado.</p>}
        {sorted.map(j => {
          const isLive = j.status === 'em_andamento'
          const isDone = j.status === 'finalizado'
          return (
            <div key={j.id} style={{ background: 'var(--bg-card)', border: `0.5px solid ${isLive ? 'var(--red-border)' : 'var(--b-1)'}`, borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--t-3)' }}>{nomeCamp(j.campeonato_id)} · Rodada {j.rodada}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: isDone ? 'var(--bg-card-2)' : isLive ? 'var(--red-dim)' : 'rgba(75,159,255,0.1)', color: isDone ? 'var(--t-3)' : isLive ? 'var(--red)' : '#60A5FA' }}>
                  {isDone ? 'Encerrado' : isLive ? '● Ao vivo' : 'Agendado'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--t-1)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nomeTime(j.mandante_id)}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--t-2)', flexShrink: 0 }}>vs</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--t-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nomeTime(j.visitante_id)}</span>
              </div>

              {j.local && <p style={{ fontSize: 11, color: 'var(--t-3)', textAlign: 'center', margin: '0 0 10px' }}>📍 {j.local}</p>}
              {j.data_hora && <p style={{ fontSize: 11, color: 'var(--t-3)', textAlign: 'center', margin: '0 0 10px' }}>🗓 {new Date(j.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!isDone ? (
                  <Link to={`/admin/narracao/${j.id}`} style={{ fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 'var(--r-sm)', background: 'var(--red-dim)', border: '0.5px solid var(--red-border)', color: 'var(--red)', textDecoration: 'none' }}>
                    {isLive ? '🔴 Continuar narração' : '🎙️ Narrar jogo'}
                  </Link>
                ) : (
                  <Link to={`/m/${j.id}`} target="_blank" style={{ fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 'var(--r-sm)', background: 'var(--bg-card-2)', border: '0.5px solid var(--b-1)', color: 'var(--t-2)', textDecoration: 'none' }}>
                    👁 Ver resultado
                  </Link>
                )}
                <button onClick={() => abrir(j)} style={{ ...btnGhost, padding: '8px 12px', border: '0.5px solid var(--b-1)', borderRadius: 'var(--r-sm)', fontSize: 12 }}>✏️ Editar</button>
                <button onClick={() => deletar(j.id)} style={{ ...btnGhost, padding: '8px 12px', border: '0.5px solid var(--b-1)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--red)' }}>🗑️</button>
              </div>
            </div>
          )
        })}
      </div>

      {aberto && (
        <Sheet titulo={form.id ? 'Editar jogo' : 'Novo jogo'} onClose={() => setAberto(false)}>
          <Campo label="Campeonato">
            <select style={inp} value={form.campeonato_id || ''} onChange={e => setForm(f => ({ ...f, campeonato_id: Number(e.target.value) }))}>
              <option value="">Selecione...</option>
              {camps.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Campo>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Campo label="Mandante">
              <select style={inp} value={form.mandante_id || ''} onChange={e => setForm(f => ({ ...f, mandante_id: Number(e.target.value) }))}>
                <option value="">Selecione...</option>
                {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </Campo>
            <Campo label="Visitante">
              <select style={inp} value={form.visitante_id || ''} onChange={e => setForm(f => ({ ...f, visitante_id: Number(e.target.value) }))}>
                <option value="">Selecione...</option>
                {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </Campo>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Campo label="Rodada">
              <input style={inp} type="number" min={1} value={form.rodada} onChange={e => setForm(f => ({ ...f, rodada: Number(e.target.value) }))} />
            </Campo>
            <Campo label="Status">
              <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Jogo['status'] }))}>
                <option value="agendado">Agendado</option>
                <option value="em_andamento">Ao vivo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </Campo>
          </div>
          <Campo label="Data e hora">
            <input style={inp} type="datetime-local" value={form.data_hora} onChange={e => setForm(f => ({ ...f, data_hora: e.target.value }))} />
          </Campo>
          <Campo label="Local">
            <input style={inp} value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))} placeholder="Ex: Campo do Ibirapuera" />
          </Campo>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setAberto(false)} style={{ ...btnGhost, flex: 1, padding: '13px', border: '0.5px solid var(--b-1)', borderRadius: 'var(--r-md)', color: 'var(--t-2)' }}>Cancelar</button>
            <button onClick={salvar} style={{ ...btnPrimary, flex: 2, padding: '13px' }}>Salvar</button>
          </div>
        </Sheet>
      )}
    </div>
  )
}

function Sheet({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-sheet)', borderRadius: 'var(--r-xl) var(--r-xl) 0 0', padding: '20px 20px calc(20px + env(safe-area-inset-bottom,0px))', width: '100%', maxWidth: 480, margin: '0 auto', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, background: 'var(--b-2)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--t-1)', margin: '0 0 20px' }}>{titulo}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
      </div>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg-card-2)', border: '0.5px solid var(--b-1)', borderRadius: 'var(--r-md)', padding: '11px 14px', color: 'var(--t-1)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }
const btnPrimary: React.CSSProperties = { background: 'var(--red-dim)', border: '0.5px solid var(--red-border)', borderRadius: 'var(--r-md)', color: 'var(--red)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '9px 16px', fontFamily: 'var(--font-body)' }
const btnGhost: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--t-3)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }
