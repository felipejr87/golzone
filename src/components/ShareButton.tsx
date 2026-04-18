interface ShareProps {
  titulo: string
  texto: string
  url?: string
  variant?: 'icon' | 'full'
}

export function ShareButton({ titulo, texto, url, variant = 'full' }: ShareProps) {
  const shareUrl = url || window.location.href

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url: shareUrl })
      } catch(e) {
        if ((e as Error).name !== 'AbortError') copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(`${texto}\n${shareUrl}`)
    alert('Link copiado!')
  }

  if (variant === 'icon') {
    return (
      <button onClick={share}
        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition"
        title="Compartilhar">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
        </svg>
      </button>
    )
  }

  return (
    <button onClick={share}
      className="flex items-center gap-2 px-4 py-2.5 bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-medium rounded-full transition">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
      </svg>
      Compartilhar
    </button>
  )
}
