import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceTable } from "./invoice/InvoiceTable";
import { useToast } from "./ui/use-toast";
import { Invoice, convertDatabaseInvoice } from "./invoice/types";
import { formatCurrency } from "@/utils/formatters";
import { PreviewInvoiceDialog } from "./invoice/PreviewInvoiceDialog";
import { saveAs } from "file-saver";
import { generatePDF } from "@/utils/pdfGenerator";
import { getSettingByName } from "@/services/settingsService";

interface InvoiceHistoryProps {
  search: string;
  sortOrder: "asc" | "desc";
  filterStatus: "all" | "paid" | "unpaid" | "returned" | "not-returned";
  dateSortType: "invoice" | "return";
  filterType: "all" | "rental" | "sale" | "hybrid";
  invoiceId?: string | null;
  showFeeInfo?: boolean;
  todayOnly?: boolean; // Added todayOnly prop
}

export const InvoiceHistory = ({
  search,
  sortOrder,
  filterStatus,
  dateSortType,
  invoiceId,
  filterType,
  showFeeInfo = true,
  todayOnly = false, // Added todayOnly default value
}: InvoiceHistoryProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, [search, sortOrder, filterStatus, dateSortType]);

  const fetchInvoices = async () => {
    setLoading(true);
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

    const { data: invoicesData, error } = await query;

    if (error) {
      toast({
        title: "Erro ao carregar faturas",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    let convertedInvoices = invoicesData.map(convertDatabaseInvoice);

    // Filter by search term (now includes products in items)
    if (search) {
      convertedInvoices = convertedInvoices.filter((invoice) => {
        // Search in regular invoice fields
        const fieldsMatch = 
          invoice.client_name.toLowerCase().includes(search.toLowerCase()) ||
          invoice.client_cpf.toLowerCase().includes(search.toLowerCase()) ||
          invoice.invoice_number.toLowerCase().includes(search.toLowerCase());

        // Search in product descriptions from invoice items
        const productsMatch = invoice.items.some(item => 
          item.description?.toLowerCase().includes(search.toLowerCase())
        );

        return fieldsMatch || productsMatch;
      });
    }

    // Ordenar por data
    convertedInvoices.sort((a, b) => {
      const dateA =
        dateSortType === "invoice"
          ? new Date(a.invoice_date)
          : new Date(a.return_date || "");
      const dateB =
        dateSortType === "invoice"
          ? new Date(b.invoice_date)
          : new Date(b.return_date || "");

      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    setInvoices(convertedInvoices);
    setLoading(false);
  };

  const handleTogglePaid = async (
    invoiceId: number,
    currentStatus: boolean,
    method?: string,
    installments?: number
  ) => {
    const updateData: any = {
      is_paid: !currentStatus,
    };

    let fee = 0;

    if (method === "credito") {
      let creditPaymentSettings = await getSettingByName("Cartão de Crédito");
      fee = creditPaymentSettings.installments[installments];
    } else if (method === "link") {
      let linkPaymentSettings = await getSettingByName("Link");
      fee = linkPaymentSettings.installments[installments];
    } else {
      fee = installments;
    }

    // Se estiver marcando como pago E tiver um método de pagamento
    if (!currentStatus && method) {
      updateData.payment_method = method;

      // Se tiver um valor de taxa de pagamento (percentual), inclui no update
      if (fee !== undefined && fee !== null) {
        updateData.installments = installments;

        // Ajustar o total para incluir a taxa de pagamento
        const invoice = invoices.find((inv) => inv.id === invoiceId);

        if (invoice) {
          const additionalCosts =
            invoice.extensions?.reduce(
              (acc, ext) => acc + (ext.additionalCost || 0),
              0
            ) || 0;

          // Calcular subtotal dos itens incluindo os additionalCosts dentro de extensions
          const subtotal = invoice.items.reduce((sum, item) => {
            // Somar os additionalCosts dentro de extensions
            return sum + item.total;
          }, 0);

          // Calcular valor da taxa (percentual do subtotal)
          const feeAmount = (subtotal + additionalCosts) * (fee / 100);

          // Atualizar o total com a taxa incluída
          updateData.total = subtotal + additionalCosts - feeAmount;
        }
      }
    }

    // Se estiver marcando como não pago, remover o método de pagamento e a taxa
    if (currentStatus) {
      const invoice = invoices.find((inv) => inv.id === invoiceId);

      if (invoice) {
        const additionalCosts =
          invoice.extensions?.reduce(
            (acc, ext) => acc + (ext.additionalCost || 0),
            0
          ) || 0;

        // Calcular subtotal dos itens
        const subtotal = invoice.items.reduce(
          (sum, item) => sum + item.total,
          0
        );

        // Atualizar o total para remover a taxa de pagamento
        updateData.total = subtotal + additionalCosts;
        updateData.installments = null;
      }
      updateData.payment_method = null;
    }

    const { error } = await supabase
      .from("invoices")
      .update(updateData)
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
    if (item.is_sale) {
      let query = supabase
        .from("inventory")
        .select("total_quantity")
        .eq("product_id", item.productId);

      if (item.size !== null && item.size !== undefined) {
        query = query.eq("size", item.size);
      }

      const { data: inventoryItem, error: inventoryError } =
        await query.single();

      if (inventoryError || !inventoryItem) {
        throw new Error(`Erro ao buscar estoque para ${item.productId}`);
      }

      const newTotalQuantity = Math.max(
        0,
        inventoryItem.total_quantity + item.quantity
      );

      let updateQuery = supabase
        .from("inventory")
        .update({ total_quantity: newTotalQuantity })
        .eq("product_id", item.productId);

      if (item.size !== null && item.size !== undefined) {
        updateQuery = updateQuery.eq("size", item.size);
      }

      const { error: updateError } = await updateQuery;

      if (updateError) {
        throw new Error(`Erro ao atualizar estoque para ${item.productId}`);
      }
    } else {
      let query = supabase
        .from("inventory")
        .select("rented_quantity")
        .eq("product_id", item.productId);

      if (item.size !== null && item.size !== undefined) {
        query = query.eq("size", item.size);
      }

      const { data: inventoryItem, error: inventoryError } =
        await query.single();

      if (inventoryError || !inventoryItem) {
        throw new Error(`Erro ao buscar estoque para ${item.productId}`);
      }

      const newRentedQuantity = Math.max(
        0,
        inventoryItem.rented_quantity - item.quantity
      );

      let updateQuery = supabase
        .from("inventory")
        .update({ rented_quantity: newRentedQuantity })
        .eq("product_id", item.productId);

      if (item.size !== null && item.size !== undefined) {
        updateQuery = updateQuery.eq("size", item.size);
      }

      const { error: updateError } = await updateQuery;

      if (updateError) {
        throw new Error(`Erro ao atualizar estoque para ${item.productId}`);
      }
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
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : invoices.length > 0 ? (
        <InvoiceTable
          filterType={filterType}
          invoices={invoices}
          onTogglePaid={handleTogglePaid}
          onToggleReturned={handleToggleReturned}
          onDownload={handleDownload}
          onPreview={handlePreview}
          onDelete={handleDelete}
          formatCurrency={formatCurrency}
          invoiceId={invoiceId}
          onRefresh={fetchInvoices}
          todayOnly={todayOnly}
        />
      ) : (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium mb-2">
            Nenhuma fatura encontrada
          </h3>
          <p className="text-muted-foreground">
            Não foram encontradas faturas que correspondam aos critérios de
            busca e filtros selecionados.
          </p>
        </div>
      )}

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
