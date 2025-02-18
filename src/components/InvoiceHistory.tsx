
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceTable } from "./invoice/InvoiceTable";
import { useToast } from "./ui/use-toast";
import { Invoice, convertDatabaseInvoice, InvoiceExtension } from "./invoice/types";
import { formatCurrency } from "@/utils/formatters";
import { PreviewInvoiceDialog } from "./invoice/PreviewInvoiceDialog";
import { saveAs } from "file-saver";
import { generatePDF } from "@/utils/pdfGenerator";

export const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleExtendConfirm = async (days: number, additionalCost: number) => {
    if (selectedInvoice) {
      const extension: InvoiceExtension = {
        date: new Date().toISOString(),
        days,
        additionalCost,
      };

      const newTotal = selectedInvoice.total + additionalCost;
      const currentExtensions = selectedInvoice.extensions || [];
      const extensions = [...currentExtensions, extension];

      const { error } = await supabase
        .from("invoices")
        .update({ 
          extensions: extensions as Json[],
          total: newTotal,
          is_paid: false
        })
        .eq("id", selectedInvoice.id);

      if (error) {
        toast({
          title: "Erro ao estender aluguel",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setExtendDialogOpen(false);
      setSelectedInvoice(null);
      await fetchInvoices();
      
      toast({
        title: "Sucesso",
        description: "Aluguel estendido com sucesso",
      });
    }
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
