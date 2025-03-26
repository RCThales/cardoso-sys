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
  totalRecurring: number;
  invoiceCount: number;
  averageTicket: number;
}

interface YearlySummary {
  year: number;
  totalInvoices: number;
  totalInvestments: number;
  totalExpenses: number;
  totalRecurring: number;
  balance: number;
  monthsData: {
    month: number;
    label: string;
    invoices: number;
    investments: number;
    expenses: number;
    recurring: number;
  }[];
}

interface ExpenseDetail {
  name: string;
  description: string;
  amount: number;
}

export const generateFinancialPDF = async (
  summary: FinancialSummary,
  monthName: string,
  expenseDetails: ExpenseDetail[],
  investmentDetails: ExpenseDetail[],
  recurringDetails: ExpenseDetail[]
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
    ["Investimentos", `R$ ${formatCurrency(summary.totalInvestment)}`],
    ["Gastos Recorrentes", `R$ ${formatCurrency(summary.totalRecurring)}`],
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

  if (expenseDetails.length > 0) {
    //#region EXPENSES
    // Detalhamento das Despesas e Investimentos (na mesma página)
    let currentY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(14);
    doc.text("Detalhamento dos Gastos", 20, currentY);
    currentY += 10;

    autoTable(doc, {
      startY: currentY,
      head: [["Nome", "Valor"]],
      body: expenseDetails.map((detail) => [
        detail.name,
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

    //#endregion
  }

  if (investmentDetails.length > 0) {
    //#region INVESTMENTS
    // Detalhamento das Despesas e Investimentos (na mesma página)
    let currentY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(14);
    doc.text("Detalhamento dos Investimentos", 20, currentY);
    currentY += 10;

    autoTable(doc, {
      startY: currentY,
      head: [["Nome", "Valor"]],
      body: investmentDetails.map((detail) => [
        detail.name,
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
    //#endregion
  }

  if (recurringDetails.length > 0) {
    //#region recurringDetails
    // Detalhamento das Despesas e Investimentos (na mesma página)
    let currentY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text("Detalhamento dos Custos Recorrentes", 20, currentY);
    currentY += 10;

    autoTable(doc, {
      startY: currentY,
      head: [["Nome", "Valor"]],
      body: recurringDetails.map((detail) => [
        detail.name,
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
    //#endregion
  }

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

export const generateYearlyFinancialPDF = async (
  yearData: YearlySummary
): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  // Cabeçalho
  doc.setFontSize(20);
  doc.text("RELATÓRIO FINANCEIRO ANUAL", pageWidth / 2, 20, {
    align: "center",
  });

  // Ano
  doc.setFontSize(16);
  doc.text(`${yearData.year}`, pageWidth / 2, 30, { align: "center" });

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

  // Indicadores Financeiros Anuais
  const data = [
    ["Receita Bruta", `R$ ${formatCurrency(yearData.totalInvoices)}`],
    ["Despesas", `R$ ${formatCurrency(yearData.totalExpenses)}`],
    ["Investimentos", `R$ ${formatCurrency(yearData.totalInvestments)}`],
    ["Gastos Recorrentes", `R$ ${formatCurrency(yearData.totalRecurring)}`],
    [
      "Lucro Líquido",
      `R$ ${formatCurrency(
        yearData.totalInvoices -
          yearData.totalExpenses -
          yearData.totalInvestments -
          yearData.totalRecurring
      )}`,
    ],
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

  // Dados mensais
  let currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(14);
  doc.text("Resumo Mensal", 20, currentY);
  currentY += 10;

  // Tabela mensal
  const monthlyData = yearData.monthsData.map((month) => {
    const monthBalance =
      month.invoices - month.expenses - month.investments - month.recurring;
    return [
      month.label,
      `R$ ${formatCurrency(month.invoices)}`,
      `R$ ${formatCurrency(month.expenses)}`,
      `R$ ${formatCurrency(month.investments)}`,
      `R$ ${formatCurrency(month.recurring)}`,
      `R$ ${formatCurrency(monthBalance)}`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      ["Mês", "Receita", "Despesas", "Investimentos", "Recorrentes", "Saldo"],
    ],
    body: monthlyData,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
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

export interface PeriodSummary {
  startDate: Date;
  endDate: Date;
  totalInvoices: number;
  totalInvestments: number;
  totalExpenses: number;
  totalRecurring: number;
  balance: number;
  monthsData: {
    month: number;
    year: number;
    label: string;
    invoices: number;
    investments: number;
    expenses: number;
    recurring: number;
  }[];
}

export const generatePeriodFinancialPDF = async (
  periodData: PeriodSummary
): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  // Format the start and end dates for display
  const startDateFormatted = format(
    periodData.startDate,
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );
  const endDateFormatted = format(
    periodData.endDate,
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );

  // Cabeçalho
  doc.setFontSize(20);
  doc.text("RELATÓRIO FINANCEIRO DO PERÍODO", pageWidth / 2, 20, {
    align: "center",
  });

  // Período
  doc.setFontSize(16);
  doc.text(`${startDateFormatted} até ${endDateFormatted}`, pageWidth / 2, 30, {
    align: "center",
  });

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

  // Indicadores Financeiros do Período
  const data = [
    ["Receita Bruta", `R$ ${formatCurrency(periodData.totalInvoices)}`],
    ["Despesas", `R$ ${formatCurrency(periodData.totalExpenses)}`],
    ["Investimentos", `R$ ${formatCurrency(periodData.totalInvestments)}`],
    ["Gastos Recorrentes", `R$ ${formatCurrency(periodData.totalRecurring)}`],
    [
      "Lucro Líquido",
      `R$ ${formatCurrency(
        periodData.totalInvoices -
          periodData.totalExpenses -
          periodData.totalInvestments -
          periodData.totalRecurring
      )}`,
    ],
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

  // Dados mensais
  let currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(14);
  doc.text("Resumo Mensal", 20, currentY);
  currentY += 10;

  // Tabela mensal
  const monthlyData = periodData.monthsData.map((month) => {
    const monthBalance =
      month.invoices - month.expenses - month.investments - month.recurring;
    const monthYearLabel = `${month.label} de ${month.year}`;
    return [
      monthYearLabel,
      `R$ ${formatCurrency(month.invoices)}`,
      `R$ ${formatCurrency(month.expenses)}`,
      `R$ ${formatCurrency(month.investments)}`,
      `R$ ${formatCurrency(month.recurring)}`,
      `R$ ${formatCurrency(monthBalance)}`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        "Mês/Ano",
        "Receita",
        "Despesas",
        "Investimentos",
        "Recorrentes",
        "Saldo",
      ],
    ],
    body: monthlyData,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
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
