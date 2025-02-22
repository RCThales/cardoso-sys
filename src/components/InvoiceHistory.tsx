
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceTable } from "./invoice/InvoiceTable";
import { useToast } from "./ui/use-toast";
import { Invoice, convertDatabaseInvoice } from "./invoice/types";
import { formatCurrency } from "@/utils/formatters";
import { PreviewInvoiceDialog } from "./invoice/PreviewInvoiceDialog";
import { saveAs } from "file-saver";
import { generatePDF } from "@/utils/pdfGenerator";
import { useLocation, useSearchParams } from "react-router-dom";

interface InvoiceHistoryProps {
  search: string;
  sortOrder: "asc" | "desc";
  filterStatus: "all" | "paid" | "unpaid" | "returned" | "not-returned";
  dateSortType: "invoice" | "return";
}

export const InvoiceHistory = ({
  search,
  sortOrder,
  filterStatus,
  dateSortType,
}: InvoiceHistoryProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const highlightedInvoiceId = searchParams.get("id");

  useEffect(() => {
    fetchInvoices();
  }, [search, sortOrder, filterStatus, dateSortType]);

  const fetchInvoices = async () => {
    let query = supabase.from("invoices").select("*");

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
      query = query.or(
        `client_name.ilike.%${search}%,client_cpf.ilike.%${search}%,invoice_number.ilike.%${search}%`
      );
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

    let convertedInvoices = invoicesData.map(convertDatabaseInvoice);

    // Ordenar por data
    convertedInvoices.sort((a, b) => {
      const dateA = dateSortType === "invoice" 
        ? new Date(a.invoice_date) 
        : new Date(a.return_date || "");
      const dateB = dateSortType === "invoice" 
        ? new Date(b.invoice_date) 
        : new Date(b.return_date || "");

      return sortOrder === "asc" 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    // Se houver um ID destacado, mova essa fatura para o topo
    if (highlightedInvoiceId) {
      const highlightedIndex = convertedInvoices.findIndex(
        (inv) => inv.id === parseInt(highlightedInvoiceId)
      );
      if (highlightedIndex !== -1) {
        const [highlightedInvoice] = convertedInvoices.splice(highlightedIndex, 1);
        convertedInvoices.unshift(highlightedInvoice);
      }
    }

    setInvoices(convertedInvoices);
  };

  const handleTogglePaid = async (
    invoiceId: number,
    currentStatus: boolean,
    method?: string
  ) => {
    const { error } = await supabase
      .from("invoices")
      .update({
        is_paid: !currentStatus,
        payment_method: method,
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

  const handleToggleReturned = async (
    invoiceId: number,
    currentStatus: boolean
  ) => {
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
    try {
      // Buscar itens da fatura
      const items = await getInvoiceItems(invoiceId);

      if (!Array.isArray(items)) {
        throw new Error("Os itens da fatura não são um array.");
      }

      // Atualizar estoque dos itens
      await updateInventory(items);

      // Deletar a fatura
      await deleteInvoice(invoiceId);

      // Atualizar a lista de faturas
      await fetchInvoices();

      // Exibir toast de sucesso
      toast({
        title: "Fatura deletada",
        description: "A fatura foi deletada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar fatura:", error);
      toast({
        title: "Erro ao deletar fatura",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Função para buscar os itens da fatura
  const getInvoiceItems = async (invoiceId: number) => {
    const { data, error } = await supabase
      .from("invoices")
      .select("items")
      .eq("id", invoiceId)
      .single();

    if (error || !data || !data.items) {
      throw new Error("Erro ao buscar itens da fatura.");
    }

    // Garantir que items é um array
    return Array.isArray(data.items) ? data.items : [];
  };

  // Função para atualizar o estoque
  const updateInventory = async (items: any[]) => {
    await Promise.all(
      items
        .filter((item) => item.productId !== "delivery-fee") // Ignorar taxa de entrega
        .map(async (item) => {
          await updateItemInventory(item);
        })
    );
  };

  // Função para atualizar o estoque de um item específico
  const updateItemInventory = async (item: any) => {
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from("inventory")
      .select("rented_quantity")
      .eq("product_id", item.productId)
      .single();

    if (inventoryError || !inventoryItem) {
      throw new Error(`Erro ao buscar estoque para ${item.productId}`);
    }

    const newRentedQuantity = Math.max(
      0,
      inventoryItem.rented_quantity - item.quantity
    );

    const { error: updateError } = await supabase
      .from("inventory")
      .update({ rented_quantity: newRentedQuantity })
      .eq("product_id", item.productId);

    if (updateError) {
      throw new Error(`Erro ao atualizar estoque para ${item.productId}`);
    }
  };

  // Função para deletar a fatura
  const deleteInvoice = async (invoiceId: number) => {
    const { error: deleteError } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
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
