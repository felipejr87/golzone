import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { BottomNav } from './components/layout/BottomNav'
import Home from './pages/Home'
import Championship from './pages/Championship'
import Match from './pages/Match'
import Player from './pages/Player'
import Scout from './pages/Scout'
import Destaques from './pages/Destaques'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminCampeonatos from './pages/admin/AdminCampeonatos'
import AdminTimes from './pages/admin/AdminTimes'
import AdminJogos from './pages/admin/AdminJogos'
import AdminSumula from './pages/admin/AdminSumula'
import AdminNarracao from './pages/admin/AdminNarracao'
import DivinoLeague from './pages/DivinoLeague'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="pb-16 md:pb-0 min-h-screen">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/c/:id"      element={<Championship />} />
          <Route path="/m/:id"      element={<Match />} />
          <Route path="/p/:id"      element={<Player />} />
          <Route path="/scout"      element={<Scout />} />
          <Route path="/destaques"  element={<Destaques />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin"      element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/campeonatos" element={<AdminLayout><AdminCampeonatos /></AdminLayout>} />
          <Route path="/admin/times"       element={<AdminLayout><AdminTimes /></AdminLayout>} />
          <Route path="/admin/jogos"       element={<AdminLayout><AdminJogos /></AdminLayout>} />
          <Route path="/admin/jogos/:id/sumula" element={<AdminLayout><AdminSumula /></AdminLayout>} />
          <Route path="/admin/narracao" element={<AdminLayout><AdminNarracao /></AdminLayout>} />
          <Route path="/divino-league" element={<DivinoLeague />} />
        </Routes>
      </main>
      <BottomNav />
    </BrowserRouter>
  )
}
