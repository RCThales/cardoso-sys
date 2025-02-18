
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Check, Download, Eye, Trash2 } from "lucide-react";
import { Invoice, InvoiceExtension } from "./types";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { ReturnConfirmDialog } from "./ReturnConfirmDialog";
import { PaymentMethodDialog } from "./PaymentMethodDialog";
import { DeleteInvoiceDialog } from "./DeleteInvoiceDialog";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";

interface InvoiceTableProps {
  invoices: Invoice[];
  onTogglePaid: (invoiceId: number, currentStatus: boolean, method?: string) => void;
  onToggleReturned: (invoiceId: number, currentStatus: boolean) => void;
  onDownload: (invoice: Invoice) => void;
  onPreview: (invoice: Invoice) => void;
  onDelete: (invoiceId: number) => void;
  formatCurrency: (value: number | string | null | undefined) => string;
}

export const InvoiceTable = ({
  invoices,
  onTogglePaid,
  onToggleReturned,
  onDownload,
  onPreview,
  onDelete,
  formatCurrency,
}: InvoiceTableProps) => {
  const { toast } = useToast();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const handlePaymentToggle = (invoice: Invoice) => {
    if (invoice.is_paid) {
      onTogglePaid(invoice.id, invoice.is_paid);
      return;
    }

    if (invoice.is_returned) {
      toast({
        title: "Ação não permitida",
        description: "Não é possível alterar o status de pagamento após a devolução",
        variant: "destructive",
      });
      return;
    }
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = async (method: string) => {
    if (selectedInvoice) {
      await onTogglePaid(selectedInvoice.id, selectedInvoice.is_paid, method);
      setPaymentDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedInvoice) {
      onDelete(selectedInvoice.id);
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handleReturnedToggle = (invoice: Invoice) => {
    if (!invoice.is_paid) {
      toast({
        title: "Ação não permitida",
        description: "A fatura precisa estar paga para marcar como devolvido",
        variant: "destructive",
      });
      return;
    }
    setSelectedInvoice(invoice);
    setReturnDialogOpen(true);
  };

  const handleConfirmReturn = () => {
    if (selectedInvoice) {
      onToggleReturned(selectedInvoice.id, selectedInvoice.is_returned);
      setReturnDialogOpen(false);
      setSelectedInvoice(null);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  return (
    <>
      {showConfetti && <ReactConfetti width={width} height={height} recycle={false} />}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº Fatura</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Devolvido</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow 
              key={invoice.id}
              className={cn({
                "bg-green-50 hover:bg-green-100": invoice.is_paid && invoice.is_returned,
                "bg-yellow-50 hover:bg-yellow-100": invoice.is_paid && !invoice.is_returned,
                "bg-red-50 hover:bg-red-100": !invoice.is_paid && !invoice.is_returned,
              })}
            >
              <TableCell>
                {invoice.invoice_number}
                {invoice.extensions && invoice.extensions.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Extensões:</span>
                    {invoice.extensions.map((ext: InvoiceExtension, idx: number) => (
                      <div key={idx} className="ml-2">
                        {format(parseISO(ext.date), "dd/MM/yyyy")} (+{ext.days} dias)
                        {ext.additionalCost > 0 && ` - R$ ${formatCurrency(ext.additionalCost)}`}
                      </div>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {format(parseISO(invoice.invoice_date), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>{invoice.client_name}</TableCell>
              <TableCell className="text-right">
                R$ {formatCurrency(invoice.total)}
              </TableCell>
              <TableCell>
                {invoice.is_paid && invoice.is_returned ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">
                      {invoice.payment_method}
                    </span>
                  </div>
                ) : (
                  <Switch
                    checked={invoice.is_paid}
                    onCheckedChange={() => handlePaymentToggle(invoice)}
                    disabled={invoice.is_returned}
                  />
                )}
              </TableCell>
              <TableCell>
                {invoice.is_returned ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Switch
                    checked={invoice.is_returned}
                    onCheckedChange={() => handleReturnedToggle(invoice)}
                    disabled={!invoice.is_paid || invoice.is_returned}
                  />
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDownload(invoice)}
                  title="Baixar PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPreview(invoice)}
                  title="Visualizar fatura"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteClick(invoice)}
                  title="Deletar fatura"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ReturnConfirmDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        onConfirm={handleConfirmReturn}
        invoiceNumber={selectedInvoice?.invoice_number || ""}
      />

      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onConfirm={handlePaymentConfirm}
        total={selectedInvoice?.total || 0}
      />

      <DeleteInvoiceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        invoiceNumber={selectedInvoice?.invoice_number || ""}
      />
    </>
  );
};
