
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LoaderCircle, Search } from "lucide-react";
import { useToast } from "./ui/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Input } from "./ui/input";
import { format } from "date-fns"; // Adicionando a importação necessária
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Invoice } from "./invoice/types";
import { DeleteInvoiceDialog } from "./invoice/DeleteInvoiceDialog";
import { PreviewInvoiceDialog } from "./invoice/PreviewInvoiceDialog";
import { InvoiceTable } from "./invoice/InvoiceTable";

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, [sortOrder]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .order("invoice_date", { ascending: sortOrder === "asc" });

      if (data) {
        const formattedInvoices: Invoice[] = data.map(invoice => ({
          ...invoice,
          items: Array.isArray(invoice.items) ? (invoice.items as any[]).map(item => ({
            description: String(item.description || ''),
            quantity: parseFloat(item.quantity) || 0,
            price: parseFloat(item.price) || 0,
            total: parseFloat(item.total) || 0,
            productId: item.productId ? String(item.productId) : '',
            rentalDays: item.rentalDays ? parseFloat(item.rentalDays) : 1
          })) : [],
          created_at: invoice.created_at || new Date().toISOString(),
          total: parseFloat(String(invoice.total)) || 0,
          is_paid: !!invoice.is_paid
        }));
        setInvoices(formattedInvoices);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar faturas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteInvoiceId) return;

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", deleteInvoiceId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar fatura",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Fatura deletada com sucesso",
      });
      fetchInvoices();
    }
    setDeleteInvoiceId(null);
  };

  const handleTogglePaid = async (invoiceId: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("invoices")
      .update({ is_paid: !currentStatus })
      .eq("id", invoiceId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da fatura",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Status da fatura atualizado com sucesso",
      });
      fetchInvoices();
    }
  };

  const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    const img = new Image();
    img.src = "/lovable-uploads/e9185795-25bc-4086-a973-5a5ff9e3c108.png";
    doc.addImage(img, "PNG", 15, 15, 30, 10);

    doc.setFontSize(10);
    doc.text("Cardoso Aluguel de Muletas e Produtos Ortopédicos", 15, 35);
    doc.text("CNPJ: 57.684.914/0001-36", 15, 40);
    doc.text("Quadra 207, Lote 4, Residencial Imprensa IV, Águas Claras", 15, 45);
    doc.text("Brasília Distrito Federal 71926250", 15, 50);
    doc.text("cardosoalugueldemuletas@gmail.com", 15, 55);

    doc.setFontSize(20);
    doc.text("FATURA", 150, 30);
    doc.setFontSize(12);
    doc.text(`Nº ${invoice.invoice_number}`, 150, 40);

    doc.setFontSize(10);
    doc.text("PARA:", 15, 70);
    doc.text(invoice.client_name, 15, 75);
    doc.text(`CPF: ${invoice.client_cpf}`, 15, 80);
    doc.text(`Tel: ${invoice.client_phone}`, 15, 85);
    doc.text(`${invoice.client_address}${invoice.client_address_number ? `, ${invoice.client_address_number}` : ''}`, 15, 90);
    if (invoice.client_address_complement) {
      doc.text(invoice.client_address_complement, 15, 95);
    }
    doc.text(`${invoice.client_city} - ${invoice.client_state}`, 15, 100);
    doc.text(invoice.client_postal_code, 15, 105);

    doc.text(`Data da Fatura: ${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}`, 150, 70);
    doc.text(`Vencimento: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, 150, 75);

    const tableData = invoice.items.map((item) => [
      item.description,
      item.quantity,
      `R$ ${formatCurrency(item.price)}`,
      `R$ ${formatCurrency(item.total)}`
    ]);

    doc.autoTable({
      startY: 115,
      head: [["Descrição", "Quantidade", "Preço", "Total"]],
      body: tableData,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: R$ ${formatCurrency(invoice.total)}`, 150, finalY);
    doc.text(`Total: R$ ${formatCurrency(invoice.total)}`, 150, finalY + 5);

    doc.setFontSize(8);
    doc.text("Locação de bens móveis, dispensada de emissão de nota fiscal de serviço por não configurar atividade de prestação de serviços,", 15, 270);
    doc.text("conforme lei complementar 116/2003.", 15, 275);

    doc.save(`fatura-${invoice.invoice_number}.pdf`);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="p-6 flex justify-center items-center h-64">
        <LoaderCircle className="w-8 h-8 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou número da fatura"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Ordenar por data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Data (mais antiga primeiro)</SelectItem>
              <SelectItem value="desc">Data (mais recente primeiro)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <InvoiceTable
        invoices={filteredInvoices}
        onTogglePaid={handleTogglePaid}
        onDownload={generatePDF}
        onPreview={setPreviewInvoice}
        onDelete={setDeleteInvoiceId}
        formatCurrency={formatCurrency}
      />

      <DeleteInvoiceDialog
        open={!!deleteInvoiceId}
        onOpenChange={() => setDeleteInvoiceId(null)}
        onConfirm={handleDelete}
      />

      <PreviewInvoiceDialog
        invoice={previewInvoice}
        open={!!previewInvoice}
        onOpenChange={() => setPreviewInvoice(null)}
        onDownload={generatePDF}
        formatCurrency={formatCurrency}
      />
    </Card>
  );
};
