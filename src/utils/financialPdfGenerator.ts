
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

  // Gráfico simples de barras para visualização
  const metrics = [
    { label: "Receita", value: summary.grossIncome },
    { label: "Despesas", value: summary.expenses },
    { label: "Lucro", value: summary.netProfit },
  ];

  const maxValue = Math.max(...metrics.map(m => m.value));
  const startY = 180;
  const barHeight = 20;
  const spacing = 30;
  const maxWidth = 150;

  metrics.forEach((metric, index) => {
    const y = startY + (spacing * index);
    const width = (metric.value / maxValue) * maxWidth;
    
    // Rótulo
    doc.setFontSize(10);
    doc.text(metric.label, 20, y);
    
    // Barra
    doc.setFillColor(41, 128, 185);
    doc.rect(60, y - 8, width, barHeight, "F");
    
    // Valor
    doc.text(`R$ ${formatCurrency(metric.value)}`, 60 + width + 5, y);
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
