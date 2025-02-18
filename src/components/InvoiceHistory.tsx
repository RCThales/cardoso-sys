import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceTable } from "./invoice/InvoiceTable";
import { useToast } from "./ui/use-toast";
import { Invoice, convertDatabaseInvoice } from "./invoice/types";
import { formatCurrency } from "@/utils/formatters";
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from "react-router-dom";

export const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const { data: invoicesData, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar faturas",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Convert database records to Invoice type
    const convertedInvoices = invoicesData.map(convertDatabaseInvoice);
    setInvoices(convertedInvoices);
  };

  const handleTogglePaid = async (invoiceId: number, currentStatus: boolean, method?: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ 
        is_paid: !currentStatus,
        payment_method: method 
      })
      .eq("id", invoiceId);

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await fetchInvoices();
  };

  const handleToggleReturned = async (invoiceId: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("invoices")
      .update({ is_returned: !currentStatus })
      .eq("id", invoiceId);

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await fetchInvoices();
  };

  const handleDownload = (invoice: Invoice) => {
    const doc = new jsPDF();

    // Cabeçalho
    doc.text(`Fatura #${invoice.invoice_number}`, 10, 10);

    // Informações do Cliente
    doc.text(`Cliente: ${invoice.client_name}`, 10, 20);
    doc.text(`CPF: ${invoice.client_cpf}`, 10, 25);
    doc.text(`Telefone: ${invoice.client_phone}`, 10, 30);
    doc.text(`Endereço: ${invoice.client_address}, ${invoice.client_address_number} ${invoice.client_address_complement} - ${invoice.client_city}, ${invoice.client_state} - ${invoice.client_postal_code}`, 10, 35);

    // Tabela de Itens
    const columns = ["Descrição", "Quantidade", "Preço Unitário", "Total"];
    const rows = invoice.items.map(item => [item.description, item.quantity, formatCurrency(item.price), formatCurrency(item.total)]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 40,
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // Totais
    doc.text(`Total: R$ ${formatCurrency(invoice.total)}`, 10, finalY + 10);
    doc.text(`Data da Fatura: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 10, finalY + 15);
    doc.text(`Data de Vencimento: ${new Date(invoice.due_date).toLocaleDateString()}`, 10, finalY + 20);

    doc.save(`fatura_${invoice.invoice_number}.pdf`);
  };

  const handlePreview = (invoice: Invoice) => {
    navigate(`/invoice-preview/${invoice.id}`);
  };

  const handleDelete = async (invoiceId: number) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir esta fatura?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId);

    if (error) {
      toast({
        title: "Erro ao excluir fatura",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fatura excluída",
      description: "Fatura excluída com sucesso.",
    });

    await fetchInvoices();
  };

  return (
    <InvoiceTable
      invoices={invoices}
      onTogglePaid={handleTogglePaid}
      onToggleReturned={handleToggleReturned}
      onDownload={handleDownload}
      onPreview={handlePreview}
      onDelete={handleDelete}
      formatCurrency={formatCurrency}
    />
  );
};
