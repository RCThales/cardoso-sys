import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { Download, Eye, Search, Trash2, LoaderCircle } from "lucide-react";
import { useToast } from "./ui/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
  productId?: string;
  rentalDays?: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  created_at: string;
  client_name: string;
  client_cpf: string;
  client_phone: string;
  total: number;
  is_paid: boolean;
  client_address: string;
  client_address_number: string;
  client_address_complement: string;
  client_city: string;
  client_state: string;
  client_postal_code: string;
  items: InvoiceItem[];
  invoice_date: string;
  due_date: string;
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
            productId: item.productId ? String(item.productId) : undefined,
            rentalDays: item.rentalDays ? parseFloat(item.rentalDays) : undefined
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

  const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    const img = new Image();
    img.src = "/lovable-uploads/e9185795-25bc-4086-a973-5a5ff9e3c108.png";
    doc.addImage(img, "PNG", 15, 15, 30, 10); // Ajustado o tamanho da logo

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

    const tableData = invoice.items.map((item: InvoiceItem) => [
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº Fatura</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => (
            <TableRow 
              key={invoice.id}
              className={invoice.is_paid ? "bg-green-50" : "bg-yellow-50"}
            >
              <TableCell>{invoice.invoice_number}</TableCell>
              <TableCell>
                {format(parseISO(invoice.invoice_date), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>{invoice.client_name}</TableCell>
              <TableCell className="text-right">
                R$ {formatCurrency(invoice.total)}
              </TableCell>
              <TableCell>
                {invoice.is_paid ? "Pago" : "Pendente"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => generatePDF(invoice)}
                  title="Baixar PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPreviewInvoice(invoice)}
                  title="Visualizar fatura"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setDeleteInvoiceId(invoice.id)}
                  title="Deletar fatura"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!deleteInvoiceId} onOpenChange={() => setDeleteInvoiceId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta fatura? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteInvoiceId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Visualizar Fatura</DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Cliente</h3>
                  <p>{previewInvoice.client_name}</p>
                  <p>CPF: {previewInvoice.client_cpf}</p>
                  <p>Tel: {previewInvoice.client_phone}</p>
                  <p>{previewInvoice.client_address}{previewInvoice.client_address_number ? `, ${previewInvoice.client_address_number}` : ''}</p>
                  {previewInvoice.client_address_complement && (
                    <p>{previewInvoice.client_address_complement}</p>
                  )}
                  <p>{previewInvoice.client_city} - {previewInvoice.client_state}</p>
                  <p>{previewInvoice.client_postal_code}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Detalhes da Fatura</h3>
                  <p>Nº: {previewInvoice.invoice_number}</p>
                  <p>Data: {format(parseISO(previewInvoice.invoice_date), "dd/MM/yyyy")}</p>
                  <p>Vencimento: {format(parseISO(previewInvoice.due_date), "dd/MM/yyyy")}</p>
                  <p>Status: {previewInvoice.is_paid ? "Pago" : "Pendente"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Itens</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>R$ {formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right">R$ {formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-right space-y-1">
                <p className="font-semibold">Total: R$ {formatCurrency(previewInvoice.total)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewInvoice(null)}>
              Fechar
            </Button>
            {previewInvoice && (
              <Button onClick={() => generatePDF(previewInvoice)}>
                Baixar PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
