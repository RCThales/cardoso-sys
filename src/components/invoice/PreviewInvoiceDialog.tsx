
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Invoice } from "./types";

interface PreviewInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (invoice: Invoice) => void;
  formatCurrency: (value: number | string | null | undefined) => string;
}

export const PreviewInvoiceDialog = ({
  invoice,
  open,
  onOpenChange,
  onDownload,
  formatCurrency,
}: PreviewInvoiceDialogProps) => {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Visualizar Fatura</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Cliente</h3>
              <p>{invoice.client_name}</p>
              <p>CPF: {invoice.client_cpf}</p>
              <p>Tel: {invoice.client_phone}</p>
              <p>{invoice.client_address}{invoice.client_address_number ? `, ${invoice.client_address_number}` : ''}</p>
              {invoice.client_address_complement && (
                <p>{invoice.client_address_complement}</p>
              )}
              <p>{invoice.client_city} - {invoice.client_state}</p>
              <p>{invoice.client_postal_code}</p>
            </div>
            <div>
              <h3 className="font-semibold">Detalhes da Fatura</h3>
              <p>Nº: {invoice.invoice_number}</p>
              <p>Data: {format(parseISO(invoice.invoice_date), "dd/MM/yyyy")}</p>
              <p>Vencimento: {format(parseISO(invoice.due_date), "dd/MM/yyyy")}</p>
              <p>Status: {invoice.is_paid ? "Pago" : "Pendente"}</p>
              {invoice.is_paid && invoice.payment_method && (
                <p>Forma de Pagamento: {invoice.payment_method}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Itens</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => {
                  const description = item.size ? `${item.description} (${item.size})` : item.description;
                  return (
                    <TableRow key={index}>
                      <TableCell>{description}</TableCell>
                      <TableCell>{item.rentalDays}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">R$ {formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {invoice.extensions && invoice.extensions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Extensões do Aluguel</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Dias Adicionais</TableHead>
                    <TableHead className="text-right">Custo Adicional</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.extensions.map((extension, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(parseISO(extension.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{extension.days}</TableCell>
                      <TableCell className="text-right">R$ {formatCurrency(extension.additionalCost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-right space-y-1">
            <p className="font-semibold">Total: R$ {formatCurrency(invoice.total)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => onDownload(invoice)}>
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
