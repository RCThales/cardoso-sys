import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "./formatters";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface FinancialSummary {
  grossIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalInvestment: number;
  invoiceCount: number;
  averageTicket: number;
}

interface ExpenseDetail {
  description: string;
  amount: number;
}

export const generateFinancialPDF = async (
  summary: FinancialSummary,
  monthName: string,
  expenseDetails: ExpenseDetail[],
  investmentDetails: ExpenseDetail[]
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
  doc.text(
    [
      "Cardoso Aluguel de Muletas",
      "Quadra 207, Lote 4, Residencial Imprensa IV, Águas Claras",
      "Brasília - Distrito Federal - 71926250",
      "CNPJ: 57.684.914/0001-36",
      "cardosoalugueldemuletas@gmail.com",
    ],
    pageWidth / 2,
    45,
    { align: "center" }
  );

  // Data do relatório
  doc.setFontSize(10);
  doc.text(`Gerado em: ${today}`, pageWidth - 20, 70, { align: "right" });

  // Indicadores Financeiros
  const data = [
    ["Receita Bruta", `R$ ${formatCurrency(summary.grossIncome)}`],
    ["Despesas", `R$ ${formatCurrency(summary.totalExpenses)}`],
    ["Lucro Líquido", `R$ ${formatCurrency(summary.netProfit)}`],
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

  // Detalhamento das Despesas e Investimentos (na mesma página)
  let currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(14);
  doc.text("Detalhamento dos Gastos", 20, currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    head: [["Descrição", "Valor"]],
    body: expenseDetails.map((detail) => [
      detail.description,
      `R$ ${formatCurrency(detail.amount)}`,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [231, 76, 60],
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 11,
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(14);
  doc.text("Detalhamento dos Investimentos", 20, currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    head: [["Descrição", "Valor"]],
    body: investmentDetails.map((detail) => [
      detail.description,
      `R$ ${formatCurrency(detail.amount)}`,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 11,
    },
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
