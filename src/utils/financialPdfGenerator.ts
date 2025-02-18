
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "./formatters";

interface FinancialSummary {
  grossIncome: number;
  expenses: number;
  netProfit: number;
  totalInvestment: number;
  invoiceCount: number;
  averageTicket: number;
}

export const generateFinancialPDF = async (
  summary: FinancialSummary,
  monthName: string
): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  // Cabeçalho
  doc.setFontSize(20);
  doc.text("RELATÓRIO FINANCEIRO", pageWidth / 2, 20, { align: "center" });
  
  // Período
  doc.setFontSize(16);
  doc.text(monthName, pageWidth / 2, 30, { align: "center" });
  
  // Informações da empresa
  doc.setFontSize(10);
  doc.text([
    "Cardoso Aluguel de Muletas",
    "Quadra 207, Lote 4, Residencial Imprensa IV, Águas Claras",
    "Brasília - Distrito Federal - 71926250",
    "CNPJ: 57.684.914/0001-36",
    "cardosoalugueldemuletas@gmail.com"
  ], pageWidth / 2, 45, { align: "center" });

  // Data do relatório
  doc.setFontSize(10);
  doc.text(`Gerado em: ${today}`, pageWidth - 20, 70, { align: "right" });

  // Indicadores Financeiros
  const data = [
    ["Receita Bruta", `R$ ${formatCurrency(summary.grossIncome)}`],
    ["Despesas", `R$ ${formatCurrency(summary.expenses)}`],
    ["Lucro Líquido", `R$ ${formatCurrency(summary.netProfit)}`],
    ["Investimento Total", `R$ ${formatCurrency(summary.totalInvestment)}`],
    ["Ticket Médio", `R$ ${formatCurrency(summary.averageTicket)}`],
    ["Número de Faturas", summary.invoiceCount.toString()],
  ];

  // Tabela de indicadores
  autoTable(doc, {
    startY: 90,
    head: [["Indicador", "Valor"]],
    body: data,
    theme: "grid",
    headStyles: { 
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 11,
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "right" },
    },
  });

  // Gráfico de pizza para visualização
  const metrics = [
    { label: "Receita", value: summary.grossIncome },
    { label: "Despesas", value: summary.expenses },
    { label: "Lucro", value: summary.netProfit },
  ];

  const centerX = pageWidth / 2;
  const centerY = 200;
  const radius = 40;
  let startAngle = 0;
  const total = metrics.reduce((sum, metric) => sum + Math.abs(metric.value), 0);

  // Cores para o gráfico
  const colors = [
    { r: 41, g: 128, b: 185 },
    { r: 231, g: 76, b: 60 },
    { r: 46, g: 204, b: 113 }
  ];

  metrics.forEach((metric, index) => {
    const portion = Math.abs(metric.value) / total;
    const angle = portion * 2 * Math.PI;
    const { r, g, b } = colors[index];
    
    // Desenha arcos para simular um gráfico de pizza
    doc.setFillColor(r, g, b);
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(startAngle + angle);
    const y2 = centerY + radius * Math.sin(startAngle + angle);
    
    // Desenha triângulos para formar o gráfico de pizza
    doc.triangle(
      centerX, centerY,
      x1, y1,
      x2, y2,
      'F'
    );
    
    // Atualiza o ângulo inicial para o próximo setor
    startAngle += angle;
    
    // Adiciona a legenda
    const legendY = 250 + (index * 15);
    doc.setFillColor(r, g, b);
    doc.rect(20, legendY - 5, 10, 10, 'F');
    doc.setFontSize(10);
    doc.text(
      `${metric.label}: R$ ${formatCurrency(metric.value)} (${(portion * 100).toFixed(1)}%)`,
      35,
      legendY
    );
  });

  // Rodapé
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.text(
    "Este relatório é confidencial e destinado apenas para uso interno.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return doc.output("blob");
};
