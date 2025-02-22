import { format, parseISO } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, Download, Eye, Trash2 } from "lucide-react";
import { Invoice, InvoiceExtension } from "../types";
import { cn } from "@/lib/utils";

interface InvoiceTableRowProps {
  invoice: Invoice;
  onTogglePaid: () => void;
  onToggleReturned: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onDelete: () => void;
  formatCurrency: (value: number | string | null | undefined) => string;
  isPaidDisabled: boolean;
  isReturnedDisabled: boolean;
  current: boolean;
}

export const InvoiceTableRow = ({
  invoice,
  onTogglePaid,
  onToggleReturned,
  onDownload,
  onPreview,
  onDelete,
  formatCurrency,
  current,
  isPaidDisabled,
  isReturnedDisabled,
}: InvoiceTableRowProps) => {
  return (
    <TableRow
      className={cn({
        // Cores de fundo padrão
        "bg-green-100 hover:bg-green-200":
          invoice.is_paid && invoice.is_returned,
        "bg-yellow-100 hover:bg-yellow-200":
          invoice.is_paid && !invoice.is_returned,
        "bg-red-100 hover:bg-red-200": !invoice.is_paid && !invoice.is_returned,

        // Borda da fatura atual (current)
        "border-4 shadow-lg": current, // Aplica borda e sombra
        "border-red-400": current && !invoice.is_paid, // Borda vermelha se não estiver paga
        "border-yellow-400": current && invoice.is_paid && !invoice.is_returned, // Borda amarela se estiver paga
        "border-green-400": current && invoice.is_paid && invoice.is_returned, // Borda verde se estiver devolvida
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
                {ext.additionalCost > 0 &&
                  ` - R$ ${formatCurrency(ext.additionalCost)}`}
              </div>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell>
        {format(parseISO(invoice.invoice_date), "dd/MM/yyyy")}
      </TableCell>
      <TableCell>{invoice.client_name}</TableCell>
      <TableCell>
        {invoice.return_date &&
          format(parseISO(invoice.return_date), "dd/MM/yyyy")}
      </TableCell>
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
            onCheckedChange={onTogglePaid}
            disabled={isPaidDisabled}
          />
        )}
      </TableCell>
      <TableCell>
        {invoice.is_returned ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Switch
            checked={invoice.is_returned}
            onCheckedChange={onToggleReturned}
            disabled={isReturnedDisabled}
          />
        )}
      </TableCell>
      <TableCell className="text-right space-x-2 space-y-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onDownload}
          title="Baixar PDF"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onPreview}
          title="Visualizar fatura"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button className="invisible disabled w-4 h-4"></Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={onDelete}
          title="Deletar fatura"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
