export default function AdminStats() {
  const stats = {
    visitas_total: 1847,
    visitas_hoje: 142,
    jogos_mais_vistos: [
      { id: 1, nome: 'Vila Real FC 3×1 Esporte Clube Mauá', visitas: 423 },
      { id: 5, nome: 'Esporte Clube Mauá 1×0 ABC FC (AO VIVO)', visitas: 387 },
      { id: 7, nome: 'Vila Real FC 4×2 Diadema United', visitas: 201 },
    ],
    jogadores_mais_vistos: [
      { id: 1, nome: 'Carlão', visitas: 298, nota_media: 9.1 },
      { id: 5, nome: 'Lucão', visitas: 187, nota_media: 8.5 },
      { id: 7, nome: 'Matheus', visitas: 164, nota_media: 8.8 },
    ],
    scout_buscas: 89,
    pdfs_gerados: 12,
    compartilhamentos: 34,
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Estatísticas</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Visitas total',      valor: stats.visitas_total.toLocaleString('pt-BR'), cor: 'text-white' },
          { label: 'Visitas hoje',       valor: stats.visitas_hoje,  cor: 'text-green-400' },
          { label: 'Buscas Scout',       valor: stats.scout_buscas,  cor: 'text-blue-400' },
          { label: 'PDFs gerados',       valor: stats.pdfs_gerados,  cor: 'text-yellow-400' },
          { label: 'Compartilhamentos',  valor: stats.compartilhamentos, cor: 'text-red-400' },
          { label: 'Jogos narrados',     valor: 7,                   cor: 'text-white' },
        ].map(k => (
          <div key={k.label} className="p-4 bg-[#0E0F15] rounded-xl border border-white/5">
            <div className={`text-2xl font-bold ${k.cor}`}>{k.valor}</div>
            <div className="text-xs text-gray-600 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#0E0F15] rounded-xl p-4 border border-white/5">
          <h2 className="text-sm font-bold text-gray-400 mb-3">Jogos mais acessados</h2>
          {stats.jogos_mais_vistos.map((j, i) => (
            <div key={j.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <span className="text-gray-700 w-5 text-sm">{i+1}</span>
              <span className="text-white text-xs flex-1 leading-tight">{j.nome}</span>
              <span className="text-green-400 font-bold text-sm">{j.visitas}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#0E0F15] rounded-xl p-4 border border-white/5">
          <h2 className="text-sm font-bold text-gray-400 mb-3">Jogadores mais buscados</h2>
          {stats.jogadores_mais_vistos.map((j, i) => (
            <div key={j.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <span className="text-gray-700 w-5 text-sm">{i+1}</span>
              <span className="text-white text-sm flex-1">{j.nome}</span>
              <span className="text-yellow-400 text-sm font-bold">{j.nota_media}</span>
              <span className="text-gray-600 text-xs">{j.visitas}v</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
