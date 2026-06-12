import { formatToBRLDateTimeShort } from '@/helpers/date';
import type { IPartidaDashboard } from '@/interface/IDashboard';

export async function gerarPalpitesPDF(
  nomeUsuario: string,
  emailUsuario: string,
  pontos: number,
  posicao: number,
  palpitesList: IPartidaDashboard[],
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Cabeçalho Principal (Marca)
  doc.setFillColor(9, 9, 11); // Zinc-950
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PALPITA AI', 15, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 170); // zinc-400
  doc.text('O Bolão Oficial da Copa do Mundo', 15, 28);

  const dataGeracao = formatToBRLDateTimeShort(new Date());
  doc.text(
    `Gerado em: ${dataGeracao}`,
    210 - 15 - doc.getTextWidth(`Gerado em: ${dataGeracao}`),
    28,
  );

  // 2. Informações do Competidor (Card)
  doc.setTextColor(9, 9, 11); // Zinc-950
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Resumo do Competidor', 15, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(63, 63, 70); // Zinc-700
  doc.text(`Nome: ${nomeUsuario}`, 15, 58);
  doc.text(`Email: ${emailUsuario}`, 15, 64);

  // Performance
  doc.setFont('helvetica', 'bold');
  doc.text('Performance:', 120, 58);

  // Pontos
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.text(`${pontos} ${pontos === 1 ? 'Ponto' : 'Pontos'}`, 120, 64);

  // Ranking
  doc.setTextColor(13, 148, 136); // Teal-600
  doc.text(`Classificação: #${posicao}`, 160, 64);

  // Linha divisória
  doc.setDrawColor(228, 228, 231); // Zinc-200
  doc.setLineWidth(0.5);
  doc.line(15, 72, 195, 72);

  // 3. Tabela de Palpites
  doc.setTextColor(9, 9, 11); // Zinc-950
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Meus Palpites Realizados', 15, 82);

  // Preparar os dados para a tabela (sem emojis para evitar falha de renderização das fontes padrão)
  const headers = [
    ['Rodada', 'Partida', 'Seu Palpite', 'Placar Oficial', 'Pontos'],
  ];

  const obterVencedor = (
    golsA: number,
    golsB: number,
  ): 'A' | 'B' | 'EMPATE' => {
    if (golsA > golsB) return 'A';
    if (golsB > golsA) return 'B';
    return 'EMPATE';
  };

  const rows = palpitesList.map((p) => {
    const partidaTexto = `${p.timeA} x ${p.timeB}`;

    const palpiteTexto =
      p.palpiteGolsA !== null && p.palpiteGolsB !== null
        ? `${p.palpiteGolsA} x ${p.palpiteGolsB}`
        : '-';

    const oficialTexto =
      p.golsTimeA !== null && p.golsTimeB !== null
        ? `${p.golsTimeA} x ${p.golsTimeB}`
        : 'Pendente';

    let pontosGanhos = '-';
    if (
      p.golsTimeA !== null &&
      p.golsTimeA !== undefined &&
      p.golsTimeB !== null &&
      p.golsTimeB !== undefined &&
      p.palpiteGolsA !== null &&
      p.palpiteGolsA !== undefined &&
      p.palpiteGolsB !== null &&
      p.palpiteGolsB !== undefined
    ) {
      const vencedorPalpite = obterVencedor(p.palpiteGolsA, p.palpiteGolsB);
      const vencedorPartida = obterVencedor(p.golsTimeA, p.golsTimeB);
      const acertouPlacarExato =
        p.palpiteGolsA === p.golsTimeA && p.palpiteGolsB === p.golsTimeB;

      if (acertouPlacarExato) {
        pontosGanhos = '+2 pts';
      } else if (vencedorPalpite === vencedorPartida) {
        pontosGanhos = '+1 pt';
      } else {
        pontosGanhos = '0 pts';
      }
    }

    return [
      p.rodadaNome || '-',
      partidaTexto,
      palpiteTexto,
      oficialTexto,
      pontosGanhos,
    ];
  });

  autoTable(doc, {
    startY: 88,
    head: headers,
    body: rows,
    headStyles: {
      fillColor: [9, 9, 11], // Zinc-950
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [39, 39, 42], // Zinc-800
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 70 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.cell.section === 'body') {
        const text = data.cell.raw as string;
        if (text === '+2 pts') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald-500
          data.cell.styles.fontStyle = 'bold';
        } else if (text === '+1 pt') {
          data.cell.styles.textColor = [13, 148, 136]; // Teal-600
          data.cell.styles.fontStyle = 'bold';
        } else if (text === '0 pts') {
          data.cell.styles.textColor = [239, 68, 68]; // Red-500
        }
      }
    },
  });

  const nomeArquivo = `palpites-${nomeUsuario
    .toLowerCase()
    .replace(/\s+/g, '-')}.pdf`;
  doc.save(nomeArquivo);
}
