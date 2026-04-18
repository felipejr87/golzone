import jsPDF from 'jspdf'

export async function gerarRelatorioScout(jogador: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const primaryRed = [232, 35, 42] as [number, number, number]
  const darkBg    = [6, 6, 8]     as [number, number, number]

  // Fundo
  doc.setFillColor(...darkBg)
  doc.rect(0, 0, W, 297, 'F')

  // Header vermelho
  doc.setFillColor(...primaryRed)
  doc.rect(0, 0, W, 45, 'F')

  // Logo texto
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('DIVINO TV', 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 200, 200)
  doc.text('RELATÓRIO DE SCOUT — CONFIDENCIAL', 14, 27)

  // Data
  doc.setTextColor(255, 200, 200)
  doc.setFontSize(9)
  doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, W - 14, 27, { align: 'right' })

  // Nome do jogador
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.text((jogador.apelido || jogador.nome).toUpperCase(), 14, 42)

  // Info básica
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 200, 200)
  const infoLine = [
    jogador.nome,
    jogador.posicao ? `· ${jogador.posicao.toUpperCase()}` : '',
  ].filter(Boolean).join(' ')
  doc.text(infoLine, W - 14, 42, { align: 'right' })

  // KPIs — linha de cards
  const kpis = [
    { label: 'NOTA MÉDIA',    valor: jogador.nota_media || '—',   cor: [0, 214, 143] as [number,number,number] },
    { label: 'JOGOS AVAL.',   valor: String(jogador.jogos),        cor: [255,255,255] as [number,number,number] },
    { label: 'GOLS',          valor: String(jogador.gols_total),   cor: [255,255,255] as [number,number,number] },
    { label: 'MELHOR DO JOGO',valor: `${jogador.melhor_jogo_count}x`, cor: [245,184,0] as [number,number,number] },
  ]

  let kpiX = 14
  kpis.forEach(k => {
    doc.setFillColor(20, 20, 28)
    doc.roundedRect(kpiX, 53, 42, 24, 3, 3, 'F')
    doc.setTextColor(...k.cor)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(String(k.valor), kpiX + 21, 66, { align: 'center' })
    doc.setTextColor(120, 120, 140)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(k.label, kpiX + 21, 73, { align: 'center' })
    kpiX += 46
  })

  // Linha separadora
  doc.setDrawColor(232, 35, 42)
  doc.setLineWidth(0.5)
  doc.line(14, 83, W - 14, 83)

  // Histórico de notas
  let y = 92
  doc.setTextColor(232, 35, 42)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('HISTÓRICO DE AVALIAÇÕES', 14, y)
  y += 8

  const notas = jogador.historico_notas || []
  if (!notas.length) {
    doc.setTextColor(100, 100, 120)
    doc.setFontSize(10)
    doc.text('Nenhuma avaliação registrada.', 14, y)
    y += 10
  } else {
    // Cabeçalho tabela
    doc.setFillColor(20, 20, 28)
    doc.rect(14, y, W - 28, 8, 'F')
    doc.setTextColor(150, 150, 170)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('JOGO', 18, y + 5.5)
    doc.text('CAMPEONATO', 80, y + 5.5)
    doc.text('NOTA', W - 20, y + 5.5, { align: 'right' })
    y += 10

    notas.slice(0, 10).forEach((n: any, i: number) => {
      if (i % 2 === 0) {
        doc.setFillColor(15, 15, 20)
        doc.rect(14, y - 4, W - 28, 9, 'F')
      }
      const nota = Number(n.nota)
      const corNota: [number,number,number] = nota >= 8 ? [0,214,143] : nota >= 6 ? [245,184,0] : [232,35,42]
      const jogoTxt = n.jogo
        ? `${n.jogo.mandante?.nome} vs ${n.jogo.visitante?.nome} — R${n.jogo.rodada}`
        : `Jogo ${n.match_id}`
      const champTxt = n.jogo?.championship?.nome || '—'
      doc.setTextColor(220, 220, 230)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(jogoTxt.slice(0, 40), 18, y + 1.5)
      doc.text(champTxt.slice(0, 25), 80, y + 1.5)
      if (n.melhor_jogo) {
        doc.setTextColor(245, 184, 0)
        doc.text('* Melhor', W - 50, y + 1.5)
      }
      doc.setTextColor(...corNota)
      doc.setFont('helvetica', 'bold')
      doc.text(String(n.nota), W - 20, y + 1.5, { align: 'right' })
      y += 9
    })
  }

  // Premiações
  y += 6
  doc.setDrawColor(50, 50, 60)
  doc.setLineWidth(0.3)
  doc.line(14, y, W - 14, y)
  y += 8

  if (jogador.premios?.length) {
    doc.setTextColor(232, 35, 42)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('PREMIAÇÕES', 14, y)
    y += 8

    jogador.premios.forEach((p: any) => {
      doc.setFillColor(25, 20, 5)
      doc.roundedRect(14, y - 3, W - 28, 9, 2, 2, 'F')
      doc.setTextColor(245, 184, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(p.tipo.replace(/_/g, ' ').toUpperCase(), 18, y + 3)
      doc.setTextColor(180, 160, 100)
      doc.setFont('helvetica', 'normal')
      doc.text(p.referencia || '', W - 18, y + 3, { align: 'right' })
      y += 12
    })
  }

  // Footer
  doc.setFillColor(...darkBg)
  doc.rect(0, 285, W, 12, 'F')
  doc.setDrawColor(...primaryRed)
  doc.setLineWidth(0.4)
  doc.line(0, 285, W, 285)
  doc.setTextColor(100, 100, 120)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Divino TV — Dados exclusivos de narração esportiva', 14, 292)
  doc.text('Relatório gerado via Divino App', W - 14, 292, { align: 'right' })

  // Download
  const nomeArq = `scout-${(jogador.apelido || jogador.nome).toLowerCase().replace(/\s+/g, '-')}-divinotv.pdf`
  doc.save(nomeArq)
}
