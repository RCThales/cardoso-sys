import { jsPDF } from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { Invoice, InvoiceExtension } from "@/components/invoice/types";
import { format, parseISO, differenceInDays } from "date-fns";
import { formatCurrency } from "./formatters";

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

// Função para determinar o tipo da fatura (VENDA, ALUGUEL ou HÍBRIDO)
const getInvoiceType = (invoice: Invoice): "VENDA" | "ALUGUEL" | "HÍBRIDO" => {
  // Filtra os itens, ignorando o Frete (delivery-fee)
  const filteredItems = invoice.items.filter(
    (item) => item.productId !== "delivery-fee"
  );

  // Verifica se todos os itens filtrados são VENDA ou ALUGUEL
  const allSales = filteredItems.every((item) => item.is_sale);
  const allRentals = filteredItems.every((item) => !item.is_sale);

  if (allSales) {
    return "VENDA";
  } else if (allRentals) {
    return "ALUGUEL";
  } else {
    return "HÍBRIDO";
  }
};

export const generatePDF = async (invoice: Invoice): Promise<Blob> => {
  const doc = new jsPDF() as ExtendedJsPDF;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Determina o tipo da fatura
  const invoiceType = getInvoiceType(invoice);

  // Adicionar o logo
  const logo = new Image();
  logo.src = "/screenshot-wide.png";
  doc.addImage(logo, "PNG", 15, 10, 40, 20);

  // Define o título com base no tipo da fatura
  const title =
    invoiceType === "VENDA"
      ? "FATURA DE VENDA"
      : invoiceType === "ALUGUEL"
      ? "FATURA DE LOCAÇÃO"
      : "FATURA DE LOCAÇÃO E VENDA";

  // Cabeçalho
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 20, { align: "center" });

  // Informações da empresa
  doc.setFontSize(10);
  doc.text(
    [
      "Cardoso Aluguel de Muletas",
      "Quadra 207, Lote 4, Residencial Imprensa IV, Águas Claras",
      "Brasília - Distrito Federal - 71926250",
      "CNPJ: 57.684.914/0001-36",
      "cardosoalugueldemuletas@gmail.com",
      "(61)98198-8450",
    ],
    pageWidth / 2,
    30,
    { align: "center" }
  );

  doc.setFontSize(12);
  doc.text(`Nº: ${invoice.invoice_number}`, pageWidth / 2, 60, {
    align: "center",
  });

  // Informações do Cliente
  doc.setFontSize(10);
  doc.text(
    [
      `Cliente: ${invoice.client_name}`,
      `CPF: ${invoice.client_cpf}`,
      `Tel: ${invoice.client_phone}`,
      `Endereço: ${invoice.client_address}${
        invoice.client_address_number
          ? `, ${invoice.client_address_number}`
          : ""
      }`,
      invoice.client_address_complement
        ? `Complemento: ${invoice.client_address_complement}`
        : "",
      invoice.client_neighborhood
        ? `Bairro/RA: ${invoice.client_neighborhood}`
        : "",
      `${invoice.client_city} - ${invoice.client_state}`,
      `CEP: ${invoice.client_postal_code}`,
    ],
    15,
    75
  );

  // Calcular os dias entre as datas
  const days = invoice.return_date
    ? differenceInDays(
        parseISO(invoice.return_date),
        parseISO(invoice.invoice_date)
      )
    : 0;

  // Informações da Fatura
  const returnDateFormatted = invoice.return_date
    ? format(parseISO(invoice.return_date), "dd/MM/yyyy")
    : "N/A";

  const invoiceDateFormatted = format(
    parseISO(invoice.invoice_date),
    "dd/MM/yyyy"
  );

  // Create an array of invoice info and filter out empty strings
  const invoiceInfo = [
    `Período: ${invoiceDateFormatted} ${
      invoiceType !== "VENDA" ? `a ${returnDateFormatted}` : ""
    }`,
    invoiceType !== "VENDA" ? `Duração: ${days} dias` : "",
    `Status: ${invoice.is_paid ? "Pago" : "Pendente"}`,
    invoice.payment_method
      ? `Forma de Pagamento: ${invoice.payment_method}`
      : "",
    (invoice.is_paid && invoice.payment_fee && invoice.payment_fee > 0) 
      ? `Taxa de pagamento: R$ ${formatCurrency(invoice.payment_fee)}`
      : "",
  ].filter(Boolean);

  doc.text(invoiceInfo, pageWidth - 60, 75);

  // Tabela de Itens
  const itemsTableData: RowInput[] = [];

  // Adiciona os itens principais
  invoice.items.forEach((item) => {
    const description = item.size
      ? `${item.description} (${item.size})`
      : item.description;

    // Determina o tipo do item (VENDA, ALUGUEL ou TRANSPORTE)
    const itemType =
      item.productId === "delivery-fee"
        ? "Transporte"
        : item.is_sale
        ? "Venda"
        : "Aluguel";

    // Exibe "-" para Dias se for VENDA ou Transporte
    const daysDisplay =
      item.productId === "delivery-fee" || item.is_sale
        ? "-"
        : item.rentalDays.toString();

    // Exibe "-" para Quantidade se for Transporte
    const quantityDisplay =
      item.productId === "delivery-fee" ? "-" : item.quantity.toString();

    itemsTableData.push([
      itemType, // Nova coluna para o tipo
      description,
      daysDisplay, // Dias ajustados
      quantityDisplay, // Quantidade ajustada
      `R$ ${formatCurrency(item.total)}`,
    ]);
  });

  autoTable(doc, {
    head: [["Tipo", "Descrição", "Dias", "Quantidade", "Total"]], // Nova coluna "Tipo"
    body: itemsTableData,
    startY: 105,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });

  let currentY = doc.lastAutoTable?.finalY || 105;

  // Extensões (se houver)
  if (invoice.extensions && invoice.extensions.length > 0) {
    const extensionsTableData = invoice.extensions.map(
      (ext: InvoiceExtension) => [
        format(parseISO(ext.date), "dd/MM/yyyy"),
        ext.days.toString(),
        `R$ ${formatCurrency(ext.additionalCost)}`,
      ]
    );

    autoTable(doc, {
      head: [["Data da Extensão", "Dias Adicionais", "Custo Adicional"]],
      body: extensionsTableData,
      startY: currentY + 10,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
    });

    currentY = doc.lastAutoTable?.finalY || currentY;
  }

  // Resumo financeiro
  const summaryData = [];

  // Subtotal
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  summaryData.push(["Subtotal", `R$ ${formatCurrency(subtotal)}`]);

  // Desconto (se houver)
  const discount = subtotal - invoice.total;
  if (discount > 0) {
    summaryData.push(["Desconto", `- R$ ${formatCurrency(discount)}`]);
  }

  // Extensões (valor total)
  if (invoice.extensions && invoice.extensions.length > 0) {
    const extensionsTotal = invoice.extensions.reduce(
      (sum, ext) => sum + ext.additionalCost,
      0
    );
    summaryData.push([
      "Total das Extensões",
      `R$ ${formatCurrency(extensionsTotal)}`,
    ]);
  }

  // Total Final
  summaryData.push(["Total", `R$ ${formatCurrency(invoice.total)}`]);

  autoTable(doc, {
    body: summaryData,
    startY: currentY + 10,
    theme: "plain",
    styles: { cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50, halign: "right" },
    },
  });

  // Adicionar notas se existirem
  if (invoice.notes && invoice.notes.trim().length > 0) {
    currentY = doc.lastAutoTable?.finalY || currentY;

    doc.setFontSize(12);
    doc.text("Observações:", 15, currentY + 15);

    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 30);
    doc.text(splitNotes, 15, currentY + 20);

    currentY += 20 + splitNotes.length * 5;
  }

  // Move o texto legal para o rodapé da página
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  doc.text(
    "Locação de bens móveis, dispensada de emissão de nota fiscal de serviço por não configurar atividade de prestação de serviços, conforme lei complementar 116/2003. \n\n Obs: Para entregas, o valor do frete é referente apenas a entrega, a devolução é de responsabilidade do locatário.",
    pageWidth / 2,
    pageHeight - 25,
    { align: "center", maxWidth: pageWidth - 20 }
  );

  return doc.output("blob");
};
