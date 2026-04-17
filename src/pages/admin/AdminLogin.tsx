import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_EMAIL = 'admin@divinotv.com'
const ADMIN_SENHA = 'divino2026'

export default function AdminLogin() {
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [erro, setErro]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    setTimeout(() => {
      if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
        localStorage.setItem('divino_admin', '1')
        navigate('/admin')
      } else {
        setErro('Email ou senha incorretos.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0F0A]">
      <div className="bg-[#111811] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/divinotv.jpg" alt="Divino TV" className="w-12 h-12 rounded-full object-cover mx-auto mb-3"/>
          <div className="text-2xl font-black text-white">DivinoAPP Admin</div>
          <div className="text-gray-400 text-sm mt-1">Painel Divino TV</div>
        </div>
        <form onSubmit={login} className="space-y-3">
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" type="email" required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400 transition"/>
          <input value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="Senha" type="password" required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400 transition"/>
          {erro && <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{erro}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>
        <p className="text-center text-gray-600 text-xs mt-5">
          admin@divinotv.com · divino2026
        </p>
      </div>
    </div>
  )
}
