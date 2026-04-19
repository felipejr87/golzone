import { useState, useEffect } from 'react'
import { adminStore, type Jogador, type Time } from '../../lib/adminStore'

const POSICOES: Jogador['posicao'][] = ['goleiro', 'zagueiro', 'lateral', 'volante', 'meia', 'atacante']
const BLANK: Omit<Jogador, 'id'> = { nome: '', apelido: '', posicao: 'atacante', time_id: null }

export default function AdminJogadores() {
  const [lista, setLista]   = useState<Jogador[]>([])
  const [times, setTimes]   = useState<Time[]>([])
  const [form, setForm]     = useState<Omit<Jogador, 'id'> & { id?: number }>(BLANK)
  const [aberto, setAberto] = useState(false)
  const [filtroTime, setFiltroTime] = useState<number | null>(null)
  const [filtroPosicao, setFiltroPosicao] = useState('')

  function carregar() {
    setLista(adminStore.jogadores.listar())
    setTimes(adminStore.times.listar())
  }
  useEffect(carregar, [])

  function abrir(j?: Jogador) { setForm(j ? { ...j } : { ...BLANK }); setAberto(true) }

  function salvar() {
    if (!form.nome.trim()) return
    adminStore.jogadores.salvar(form); carregar(); setAberto(false)
  }

  function deletar(id: number) {
    if (!confirm('Remover jogador?')) return
    adminStore.jogadores.deletar(id); carregar()
  }

  const filtered = lista.filter(j =>
    (!filtroTime || j.time_id === filtroTime) &&
    (!filtroPosicao || j.posicao === filtroPosicao)
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t-1)', margin: 0 }}>Jogadores</h1>
        <button onClick={() => abrir()} style={btnPrimary}>+ Novo</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select style={{ ...inp, flex: 1 }} value={filtroTime ?? ''} onChange={e => setFiltroTime(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Todos os times</option>
          {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
        <select style={{ ...inp, flex: 1 }} value={filtroPosicao} onChange={e => setFiltroPosicao(e.target.value)}>
          <option value="">Todas posições</option>
          {POSICOES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      <p style={{ fontSize: 11, color: 'var(--t-3)', marginBottom: 12 }}>{filtered.length} jogador{filtered.length !== 1 ? 'es' : ''}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'var(--t-3)', padding: '40px 0', fontSize: 13 }}>Nenhum jogador encontrado.</p>}
        {filtered.map(j => {
          const time = times.find(t => t.id === j.time_id)
          const notaCor = 'var(--t-2)'
          return (
            <div key={j.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card-2)', border: '0.5px solid var(--b-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, color: notaCor, flexShrink: 0 }}>
                {(j.apelido || j.nome).slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.apelido || j.nome}</div>
                <div style={{ fontSize: 11, color: 'var(--t-3)', marginTop: 2 }}>
                  <span style={{ textTransform: 'capitalize' }}>{j.posicao}</span>
                  {time ? ` · ${time.nome}` : ''}
                </div>
              </div>
              <button onClick={() => abrir(j)} style={btnGhost}>✏️</button>
              <button onClick={() => deletar(j.id)} style={{ ...btnGhost, color: 'var(--red)' }}>🗑️</button>
            </div>
          )
        })}
      </div>

      {aberto && (
        <Sheet titulo={form.id ? 'Editar jogador' : 'Novo jogador'} onClose={() => setAberto(false)}>
          <Campo label="Nome completo">
            <input style={inp} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Carlos Eduardo Silva" />
          </Campo>
          <Campo label="Apelido">
            <input style={inp} value={form.apelido} onChange={e => setForm(f => ({ ...f, apelido: e.target.value }))} placeholder="Ex: Carlão" />
          </Campo>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Campo label="Posição">
              <select style={inp} value={form.posicao} onChange={e => setForm(f => ({ ...f, posicao: e.target.value as Jogador['posicao'] }))}>
                {POSICOES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </Campo>
            <Campo label="Time">
              <select style={inp} value={form.time_id ?? ''} onChange={e => setForm(f => ({ ...f, time_id: e.target.value ? Number(e.target.value) : null }))}>
                <option value="">Sem time</option>
                {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </Campo>
          </div>
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
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-sheet)', borderRadius: 'var(--r-xl) var(--r-xl) 0 0', padding: '20px 20px calc(20px + env(safe-area-inset-bottom,0px))', width: '100%', maxWidth: 480, margin: '0 auto' }}>
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

const card: React.CSSProperties = { background: 'var(--bg-card)', border: '0.5px solid var(--b-1)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }
const inp: React.CSSProperties = { width: '100%', background: 'var(--bg-card-2)', border: '0.5px solid var(--b-1)', borderRadius: 'var(--r-md)', padding: '11px 14px', color: 'var(--t-1)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }
const btnPrimary: React.CSSProperties = { background: 'var(--red-dim)', border: '0.5px solid var(--red-border)', borderRadius: 'var(--r-md)', color: 'var(--red)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '9px 16px', fontFamily: 'var(--font-body)' }
const btnGhost: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--t-3)', fontSize: 16, cursor: 'pointer', padding: '4px 6px' }
