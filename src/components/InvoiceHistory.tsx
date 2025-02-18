
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceTable } from "./invoice/InvoiceTable";
import { useToast } from "./ui/use-toast";
import { Invoice, convertDatabaseInvoice } from "./invoice/types";
import { formatCurrency } from "@/utils/formatters";
import { PreviewInvoiceDialog } from "./invoice/PreviewInvoiceDialog";
import { saveAs } from "file-saver";
import { generatePDF } from "@/utils/pdfGenerator";

interface InvoiceHistoryProps {
  search: string;
  sortOrder: "asc" | "desc";
  filterStatus: "all" | "paid" | "unpaid" | "returned" | "not-returned";
}

export const InvoiceHistory = ({ search, sortOrder, filterStatus }: InvoiceHistoryProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, [search, sortOrder, filterStatus]);

  const fetchInvoices = async () => {
    let query = supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: sortOrder === "asc" });

    // Aplicar filtros de status
    switch (filterStatus) {
      case "paid":
        query = query.eq("is_paid", true);
        break;
      case "unpaid":
        query = query.eq("is_paid", false);
        break;
      case "returned":
        query = query.eq("is_returned", true);
        break;
      case "not-returned":
        query = query.eq("is_returned", false);
        break;
    }

    // Aplicar busca
    if (search) {
      query = query.or(`client_name.ilike.%${search}%,client_cpf.ilike.%${search}%,invoice_number.ilike.%${search}%`);
    }

    const { data: invoicesData, error } = await query;

    if (error) {
      toast({
        title: "Erro ao carregar faturas",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

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

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setPreviewOpen(true);
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      const pdfBlob = await generatePDF(invoice);
      saveAs(pdfBlob, `fatura-${invoice.invoice_number}.pdf`);
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF da fatura",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (invoiceId: number) => {
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId);

    if (error) {
      toast({
        title: "Erro ao deletar fatura",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await fetchInvoices();
    toast({
      title: "Fatura deletada",
      description: "A fatura foi deletada com sucesso",
    });
  };

  return (
    <>
      <InvoiceTable
        invoices={invoices}
        onTogglePaid={handleTogglePaid}
        onToggleReturned={handleToggleReturned}
        onDownload={handleDownload}
        onPreview={handlePreview}
        onDelete={handleDelete}
        formatCurrency={formatCurrency}
      />

      <PreviewInvoiceDialog
        invoice={previewInvoice}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onDownload={handleDownload}
        formatCurrency={formatCurrency}
      />
    </>
  );
};
