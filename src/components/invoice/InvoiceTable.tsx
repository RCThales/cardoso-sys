
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
import { Download, Eye, Trash2 } from "lucide-react";
import { Invoice } from "./types";

interface InvoiceTableProps {
  invoices: Invoice[];
  onTogglePaid: (invoiceId: number, currentStatus: boolean) => void;
  onDownload: (invoice: Invoice) => void;
  onPreview: (invoice: Invoice) => void;
  onDelete: (invoiceId: number) => void;
  formatCurrency: (value: number | string | null | undefined) => string;
}

export const InvoiceTable = ({
  invoices,
  onTogglePaid,
  onDownload,
  onPreview,
  onDelete,
  formatCurrency,
}: InvoiceTableProps) => {
  return (
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
        {invoices.map((invoice) => (
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
              <Switch
                checked={invoice.is_paid}
                onCheckedChange={() => onTogglePaid(invoice.id, invoice.is_paid)}
              />
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
                onClick={() => onDelete(invoice.id)}
                title="Deletar fatura"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
