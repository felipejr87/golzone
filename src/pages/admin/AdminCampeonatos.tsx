import { useState, useEffect } from 'react'
import { adminStore, type Campeonato } from '../../lib/adminStore'

const BLANK: Omit<Campeonato, 'id'> = { nome: '', categoria: '', temporada: new Date().getFullYear(), status: 'ativo', modalidade: 'campo' }

export default function AdminCampeonatos() {
  const [lista, setLista] = useState<Campeonato[]>([])
  const [form, setForm] = useState<Omit<Campeonato, 'id'> & { id?: number }>(BLANK)
  const [aberto, setAberto] = useState(false)

  function carregar() { setLista(adminStore.campeonatos.listar()) }
  useEffect(carregar, [])

  function abrir(c?: Campeonato) { setForm(c ? { ...c } : { ...BLANK }); setAberto(true) }

  function salvar() {
    if (!form.nome.trim()) return
    adminStore.campeonatos.salvar(form); carregar(); setAberto(false)
  }

  function deletar(id: number) {
    if (!confirm('Remover campeonato?')) return
    adminStore.campeonatos.deletar(id); carregar()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t-1)', margin: 0 }}>Campeonatos</h1>
        <button onClick={() => abrir()} style={btnPrimary}>+ Novo</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lista.length === 0 && <p style={{ textAlign: 'center', color: 'var(--t-3)', padding: '40px 0', fontSize: 13 }}>Nenhum campeonato ainda.</p>}
        {lista.map(c => (
          <div key={c.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--red-dim)', border: '0.5px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏆</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</div>
              <div style={{ fontSize: 11, color: 'var(--t-3)', marginTop: 2 }}>{c.categoria} · {c.temporada} · {c.modalidade}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: c.status === 'ativo' ? 'rgba(74,222,128,0.1)' : 'var(--bg-card-2)', color: c.status === 'ativo' ? 'var(--green)' : 'var(--t-3)' }}>
              {c.status}
            </span>
            <button onClick={() => abrir(c)} style={btnGhost}>✏️</button>
            <button onClick={() => deletar(c.id)} style={{ ...btnGhost, color: 'var(--red)' }}>🗑️</button>
          </div>
        ))}
      </div>

      {aberto && (
        <Sheet titulo={form.id ? 'Editar campeonato' : 'Novo campeonato'} onClose={() => setAberto(false)}>
          <Campo label="Nome do campeonato">
            <input style={inp} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Copa Divino TV 2026" />
          </Campo>
          <Campo label="Categoria">
            <input style={inp} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} placeholder="Ex: Amador, Sub-20, Feminino..." />
          </Campo>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Campo label="Temporada">
              <input style={inp} type="number" value={form.temporada} onChange={e => setForm(f => ({ ...f, temporada: Number(e.target.value) }))} />
            </Campo>
            <Campo label="Modalidade">
              <select style={inp} value={form.modalidade} onChange={e => setForm(f => ({ ...f, modalidade: e.target.value as Campeonato['modalidade'] }))}>
                <option value="campo">Campo</option>
                <option value="salão">Salão / Futsal</option>
                <option value="society">Society</option>
              </select>
            </Campo>
          </div>
          <Campo label="Status">
            <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Campeonato['status'] }))}>
              <option value="ativo">Ativo</option>
              <option value="encerrado">Encerrado</option>
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
