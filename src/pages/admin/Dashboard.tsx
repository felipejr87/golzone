import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminStore } from '../../lib/adminStore'

export default function Dashboard() {
  const [counts, setCounts] = useState({ camps: 0, times: 0, jogs: 0, jogos: 0, aoVivo: 0 })

  useEffect(() => {
    const camps = adminStore.campeonatos.listar()
    const times = adminStore.times.listar()
    const jogs  = adminStore.jogadores.listar()
    const jogos = adminStore.jogos.listar()
    setCounts({
      camps: camps.length, times: times.length, jogs: jogs.length, jogos: jogos.length,
      aoVivo: jogos.filter(j => j.status === 'em_andamento').length,
    })
  }, [])

  const kpis = [
    { label: 'Campeonatos', val: counts.camps, icon: '🏆', to: '/admin/campeonatos' },
    { label: 'Times',       val: counts.times, icon: '👕', to: '/admin/times'       },
    { label: 'Jogadores',   val: counts.jogs,  icon: '⚽', to: '/admin/jogadores'   },
    { label: 'Jogos',       val: counts.jogos, icon: '📋', to: '/admin/jogos'       },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t-1)', margin: 0, marginBottom: 4 }}>Painel</h1>
        <p style={{ fontSize: 13, color: 'var(--t-3)', margin: 0 }}>Divino TV · Sistema de gestão</p>
      </div>

      {counts.aoVivo > 0 && (
        <div style={{ background: 'var(--red-dim)', border: '0.5px solid var(--red-border)', borderRadius: 'var(--r-lg)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
          <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>{counts.aoVivo} jogo ao vivo agora</span>
          <Link to="/admin/jogos" style={{ marginLeft: 'auto', color: 'var(--red)', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>Ver →</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {kpis.map(k => (
          <Link key={k.label} to={k.to} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--b-1)', borderRadius: 'var(--r-lg)', padding: '16px 14px' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--t-1)', lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: 12, color: 'var(--t-3)', marginTop: 4 }}>{k.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Ações rápidas</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link to="/admin/jogos" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--red-dim)', border: '0.5px solid var(--red-border)', borderRadius: 'var(--r-lg)' }}>
            <span style={{ fontSize: 22 }}>🎙️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>Narrar jogo</div>
              <div style={{ fontSize: 12, color: 'var(--t-3)' }}>Selecione um jogo e inicie a narração</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--red)', fontSize: 18 }}>→</span>
          </div>
        </Link>
        {[
          { to: '/admin/campeonatos', icon: '🏆', label: 'Novo campeonato', sub: 'Cadastre e gerencie torneios' },
          { to: '/admin/times',       icon: '👕', label: 'Novo time',       sub: 'Adicione times e elencos' },
          { to: '/admin/jogadores',   icon: '⚽', label: 'Novo jogador',    sub: 'Cadastre jogadores por time' },
        ].map(a => (
          <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-card)', border: '0.5px solid var(--b-1)', borderRadius: 'var(--r-lg)' }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t-1)' }}>{a.label}</div>
                <div style={{ fontSize: 12, color: 'var(--t-3)' }}>{a.sub}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--t-3)', fontSize: 18 }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
