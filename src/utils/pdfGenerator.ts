
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice, InvoiceExtension } from "@/components/invoice/types";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "./formatters";

export const generatePDF = async (invoice: Invoice): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho
  doc.setFontSize(20);
  doc.text("FATURA", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`Nº: ${invoice.invoice_number}`, pageWidth / 2, 30, { align: "center" });
  
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
  ], 15, 45);

  // Informações da Fatura
  doc.text([
    `Data: ${format(parseISO(invoice.invoice_date), "dd/MM/yyyy")}`,
    `Vencimento: ${format(parseISO(invoice.due_date), "dd/MM/yyyy")}`,
    `Status: ${invoice.is_paid ? "Pago" : "Pendente"}`,
    invoice.payment_method ? `Forma de Pagamento: ${invoice.payment_method}` : '',
  ], pageWidth - 60, 45);

  // Tabela de Itens
  const itemsTableData = invoice.items.map(item => [
    item.description,
    item.rentalDays.toString(),
    item.quantity.toString(),
    `R$ ${formatCurrency(item.total)}`,
  ]);

  autoTable(doc, {
    head: [['Descrição', 'Dias', 'Quantidade', 'Total']],
    body: itemsTableData,
    startY: 85,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

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
      startY: doc.lastAutoTable.finalY + 10,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
  }

  // Total
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(
    `Total: R$ ${formatCurrency(invoice.total)}`,
    pageWidth - 15,
    doc.lastAutoTable.finalY + 20,
    { align: "right" }
  );

  return doc.output('blob');
};
