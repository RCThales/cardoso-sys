
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
import { format } from "date-fns";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Invoice {
  id: number;
  invoice_number: string;
  created_at: string;
  client_name: string;
  total: number;
  payment_received: number;
  balance_due: number;
  client_address: string;
  client_city: string;
  client_state: string;
  client_postal_code: string;
  items: any[];
  invoice_date: string;
  due_date: string;
}

export const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setInvoices(data);
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

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    // Add logo
    const img = new Image();
    img.src = "/lovable-uploads/e9185795-25bc-4086-a973-5a5ff9e3c108.png";
    doc.addImage(img, "PNG", 15, 15, 60, 20);

    // Company info
    doc.setFontSize(10);
    doc.text("Cardoso Aluguel de Muletas e Produtos Ortopédicos", 15, 45);
    doc.text("CNPJ: 57.684.914/0001-36", 15, 50);
    doc.text("Quadra 207, Lote 4, Residencial Imprensa IV, Águas Claras", 15, 55);
    doc.text("Brasília Distrito Federal 71926250", 15, 60);
    doc.text("cardosoalugueldemuletas@gmail.com", 15, 65);

    // Invoice info
    doc.setFontSize(20);
    doc.text("FATURA", 150, 30);
    doc.setFontSize(12);
    doc.text(`Nº ${invoice.invoice_number}`, 150, 40);

    // Client info
    doc.setFontSize(10);
    doc.text("PARA:", 15, 80);
    doc.text(invoice.client_name, 15, 85);
    doc.text(invoice.client_address, 15, 90);
    doc.text(`${invoice.client_city} - ${invoice.client_state}`, 15, 95);
    doc.text(invoice.client_postal_code, 15, 100);

    // Dates
    doc.text(`Data da Fatura: ${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}`, 150, 80);
    doc.text(`Vencimento: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, 150, 85);

    // Items table
    const tableData = invoice.items.map((item: any) => [
      item.description,
      item.quantity,
      `R$ ${item.price.toFixed(2)}`,
      `R$ ${item.total.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 110,
      head: [["Descrição", "Quantidade", "Preço", "Total"]],
      body: tableData,
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: R$ ${invoice.total.toFixed(2)}`, 150, finalY);
    doc.text(`Total: R$ ${invoice.total.toFixed(2)}`, 150, finalY + 5);
    doc.text(`Pago: R$ ${invoice.payment_received.toFixed(2)}`, 150, finalY + 10);
    doc.text(`Saldo Devido: R$ ${invoice.balance_due.toFixed(2)}`, 150, finalY + 15);

    // Footer
    doc.setFontSize(8);
    doc.text("Locação de bens móveis, dispensada de emissão de nota fiscal de serviço por não configurar atividade de prestação de serviços,", 15, 270);
    doc.text("conforme lei complementar 116/2003.", 15, 275);

    doc.save(`fatura-${invoice.invoice_number}.pdf`);
  };

  return (
    <Card className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº Fatura</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Recebido</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.invoice_number}</TableCell>
              <TableCell>
                {format(new Date(invoice.created_at), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>{invoice.client_name}</TableCell>
              <TableCell className="text-right">
                R$ {invoice.total.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                R$ {invoice.payment_received.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                R$ {invoice.balance_due.toFixed(2)}
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
    </Card>
  );
};
