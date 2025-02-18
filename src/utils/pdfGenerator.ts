
import { jsPDF } from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { Invoice, InvoiceExtension } from "@/components/invoice/types";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "./formatters";

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export const generatePDF = async (invoice: Invoice): Promise<Blob> => {
  const doc = new jsPDF() as ExtendedJsPDF;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho
  doc.setFontSize(20);
  doc.text("FATURA", pageWidth / 2, 20, { align: "center" });
  
  // Informações da empresa
  doc.setFontSize(10);
  doc.text([
    "Cardoso Aluguel de Muletas",
    "Quadra 207, Lote 4, Residencial Imprensa IV, Águas Claras",
    "Brasília - Distrito Federal - 71926250",
    "CNPJ: 57.684.914/0001-36",
    "cardosoalugueldemuletas@gmail.com"
  ], pageWidth / 2, 30, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`Nº: ${invoice.invoice_number}`, pageWidth / 2, 60, { align: "center" });
  
  // Informações do Cliente
  doc.setFontSize(10);
  doc.text([
    `Cliente: ${invoice.client_name}`,
    `CPF: ${invoice.client_cpf}`,
    `Tel: ${invoice.client_phone}`,
    `Endereço: ${invoice.client_address}${invoice.client_address_number ? `, ${invoice.client_address_number}` : ''}`,
    invoice.client_address_complement ? `Complemento: ${invoice.client_address_complement}` : '',
    `${invoice.client_city} - ${invoice.client_state}`,
    `CEP: ${invoice.client_postal_code}`,
  ], 15, 75);

  // Informações da Fatura
  doc.text([
    `Data: ${format(parseISO(invoice.invoice_date), "dd/MM/yyyy")}`,
    `Vencimento: ${format(parseISO(invoice.due_date), "dd/MM/yyyy")}`,
    `Status: ${invoice.is_paid ? "Pago" : "Pendente"}`,
    invoice.payment_method ? `Forma de Pagamento: ${invoice.payment_method}` : '',
  ], pageWidth - 60, 75);

  // Tabela de Itens
  const itemsTableData: string[][] = [];
  
  // Adiciona os itens principais
  invoice.items.forEach(item => {
    if (item.productId !== 'delivery-fee') {
      itemsTableData.push([
        item.description,
        item.rentalDays.toString(),
        item.quantity.toString(),
        `R$ ${formatCurrency(item.total)}`,
      ]);
    }
  });

  // Adiciona o frete se existir
  const deliveryItem = invoice.items.find(item => item.productId === 'delivery-fee');
  if (deliveryItem && deliveryItem.total > 0) {
    itemsTableData.push([
      'Frete',
      '1',
      '1',
      `R$ ${formatCurrency(deliveryItem.total)}`,
    ]);
  }

  autoTable(doc, {
    head: [['Descrição', 'Dias', 'Quantidade', 'Total']],
    body: itemsTableData,
    startY: 105,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  let currentY = doc.lastAutoTable?.finalY || 105;

  // Extensões (se houver)
  if (invoice.extensions && invoice.extensions.length > 0) {
    const extensionsTableData = invoice.extensions.map((ext: InvoiceExtension) => [
      format(parseISO(ext.date), "dd/MM/yyyy"),
      ext.days.toString(),
      `R$ ${formatCurrency(ext.additionalCost)}`,
    ]);

    autoTable(doc, {
      head: [['Data da Extensão', 'Dias Adicionais', 'Custo Adicional']],
      body: extensionsTableData,
      startY: currentY + 10,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    currentY = doc.lastAutoTable?.finalY || currentY;
  }

  // Resumo financeiro
  const summaryData = [];
  
  // Subtotal
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  summaryData.push(['Subtotal', `R$ ${formatCurrency(subtotal)}`]);
  
  // Frete (se houver)
  if (deliveryItem && deliveryItem.total > 0) {
    summaryData.push(['Frete', `R$ ${formatCurrency(deliveryItem.total)}`]);
  }
  
  // Desconto (se houver)
  const discount = subtotal - invoice.total;
  if (discount > 0) {
    summaryData.push(['Desconto', `- R$ ${formatCurrency(discount)}`]);
  }

  // Extensões (valor total)
  if (invoice.extensions && invoice.extensions.length > 0) {
    const extensionsTotal = invoice.extensions.reduce((sum, ext) => sum + ext.additionalCost, 0);
    summaryData.push(['Total das Extensões', `R$ ${formatCurrency(extensionsTotal)}`]);
  }

  // Total Final
  summaryData.push(['Total', `R$ ${formatCurrency(invoice.total)}`]);

  autoTable(doc, {
    body: summaryData,
    startY: currentY + 10,
    theme: 'plain',
    styles: { cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50, halign: 'right' },
    },
  });

  // Adiciona o texto legal no rodapé
  currentY = doc.lastAutoTable?.finalY || currentY;
  doc.setFontSize(8);
  doc.text(
    "Locação de bens móveis, dispensada de emissão de nota fiscal de serviço por não configurar atividade de prestação de serviços, conforme lei complementar 116/2003.",
    pageWidth / 2,
    currentY + 20,
    { align: "center", maxWidth: pageWidth - 20 }
  );

  return doc.output('blob');
};
