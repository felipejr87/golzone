import { useState, useEffect } from 'react'
import { adminStore, type Time, type Campeonato } from '../../lib/adminStore'

const BLANK: Omit<Time, 'id'> = { nome: '', cidade: '', campeonato_id: null }

export default function AdminTimes() {
  const [lista, setLista]   = useState<Time[]>([])
  const [camps, setCamps]   = useState<Campeonato[]>([])
  const [form, setForm]     = useState<Omit<Time, 'id'> & { id?: number }>(BLANK)
  const [aberto, setAberto] = useState(false)
  const [filtro, setFiltro] = useState<number | null>(null)

  function carregar() {
    setLista(adminStore.times.listar())
    setCamps(adminStore.campeonatos.listar())
  }
  useEffect(carregar, [])

  function abrir(t?: Time) { setForm(t ? { ...t } : { ...BLANK }); setAberto(true) }

  function salvar() {
    if (!form.nome.trim()) return
    adminStore.times.salvar(form); carregar(); setAberto(false)
  }

  function deletar(id: number) {
    if (!confirm('Remover time?')) return
    adminStore.times.deletar(id); carregar()
  }

  const listaf = filtro ? lista.filter(t => t.campeonato_id === filtro) : lista

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t-1)', margin: 0 }}>Times</h1>
        <button onClick={() => abrir()} style={btnPrimary}>+ Novo</button>
      </div>

      {camps.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          <button onClick={() => setFiltro(null)} style={{ ...chip, background: filtro === null ? 'var(--red-dim)' : 'var(--bg-card)', border: `0.5px solid ${filtro === null ? 'var(--red-border)' : 'var(--b-1)'}`, color: filtro === null ? 'var(--red)' : 'var(--t-3)', whiteSpace: 'nowrap' }}>Todos</button>
          {camps.map(c => (
            <button key={c.id} onClick={() => setFiltro(filtro === c.id ? null : c.id)} style={{ ...chip, background: filtro === c.id ? 'var(--red-dim)' : 'var(--bg-card)', border: `0.5px solid ${filtro === c.id ? 'var(--red-border)' : 'var(--b-1)'}`, color: filtro === c.id ? 'var(--red)' : 'var(--t-3)', whiteSpace: 'nowrap' }}>{c.nome}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {listaf.length === 0 && <p style={{ textAlign: 'center', color: 'var(--t-3)', padding: '40px 0', fontSize: 13 }}>Nenhum time ainda.</p>}
        {listaf.map(t => {
          const camp = camps.find(c => c.id === t.campeonato_id)
          const numJogs = adminStore.jogadores.porTime(t.id).length
          return (
            <div key={t.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-card-2)', border: '0.5px solid var(--b-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--t-2)', flexShrink: 0 }}>
                {t.nome.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nome}</div>
                <div style={{ fontSize: 11, color: 'var(--t-3)', marginTop: 2 }}>
                  {t.cidade}{camp ? ` · ${camp.nome}` : ''}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--t-3)', flexShrink: 0 }}>{numJogs} jog.</span>
              <button onClick={() => abrir(t)} style={btnGhost}>✏️</button>
              <button onClick={() => deletar(t.id)} style={{ ...btnGhost, color: 'var(--red)' }}>🗑️</button>
            </div>
          )
        })}
      </div>

      {aberto && (
        <Sheet titulo={form.id ? 'Editar time' : 'Novo time'} onClose={() => setAberto(false)}>
          <Campo label="Nome do time">
            <input style={inp} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Flamengo Várzea" />
          </Campo>
          <Campo label="Cidade">
            <input style={inp} value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} placeholder="Ex: Santo André" />
          </Campo>
          <Campo label="Campeonato (opcional)">
            <select style={inp} value={form.campeonato_id ?? ''} onChange={e => setForm(f => ({ ...f, campeonato_id: e.target.value ? Number(e.target.value) : null }))}>
              <option value="">Sem campeonato</option>
              {camps.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
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
const chip: React.CSSProperties = { fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 100, cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 }
