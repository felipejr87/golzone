const PALETTE = ['#E8232A','#4B9FFF','#00C98D','#F5B800','#A855F7','#F97316']

function hashColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

function abbr(nome: string) {
  return nome.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase().slice(0,2)
}

interface Props { nome: string; escudo_url?: string|null; size?: number }

export function TeamBadge({ nome, escudo_url, size=40 }: Props) {
  const cor = hashColor(nome)
  if (escudo_url) {
    return (
      <img src={escudo_url} alt={nome} width={size} height={size}
        style={{ objectFit:'contain', borderRadius:'50%', flexShrink:0 }} />
    )
  }
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`${cor}18`, border:`1.5px solid ${cor}40`,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:cor, fontSize:size*0.32, fontWeight:700,
      fontFamily:'var(--font-display)', letterSpacing:'0.03em',
    }}>
      {abbr(nome)}
    </div>
  )
}
