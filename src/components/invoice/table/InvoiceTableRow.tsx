import { format, parseISO, differenceInDays } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  Download,
  Eye,
  Trash2,
  Tag,
  Calendar,
  Circle,
  StickyNote,
  AlertOctagon,
} from "lucide-react";
import { Invoice, InvoiceExtension } from "../types";
import { cn } from "@/lib/utils";

interface InvoiceTableRowProps {
  invoice: Invoice;
  onTogglePaid: () => void;
  onToggleReturned: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onDelete: () => void;
  onNotesClick: () => void;
  formatCurrency: (value: number | string | null | undefined) => string;
  isPaidDisabled: boolean;
  isReturnedDisabled: boolean;
  current: boolean;
  invoiceType: "VENDA" | "ALUGUEL" | "HÍBRIDO";
}

export const InvoiceTableRow = ({
  invoice,
  onTogglePaid,
  onToggleReturned,
  onDownload,
  onPreview,
  onDelete,
  onNotesClick,
  formatCurrency,
  current,
  isPaidDisabled,
  isReturnedDisabled,
  invoiceType,
}: InvoiceTableRowProps) => {
  // Ícone e texto com base no tipo da fatura
  const invoiceTypeIcon =
    invoiceType === "VENDA" ? (
      <Tag className="h-4 w-4 text-blue-500" />
    ) : invoiceType === "ALUGUEL" ? (
      <Calendar className="h-4 w-4 text-green-500" />
    ) : (
      <Circle className="h-4 w-4 text-yellow-500" />
    );

  const invoiceTypeText =
    invoiceType === "VENDA"
      ? "VENDA"
      : invoiceType === "ALUGUEL"
      ? "ALUGUEL"
      : "HÍBRIDO";

  // Verifica se a fatura é do tipo VENDA
  const isSale = invoiceType === "VENDA";

  // Função para formatar o nome do cliente limitando a 2 palavras por linha
  const formatClientName = (name: string) => {
    const words = name.split(" ");
    if (words.length <= 2) return name;

    return (
      <div>
        <div>{words.slice(0, 2).join(" ")}</div>
        <div className="text-xs">{words.slice(2).join(" ")}</div>
      </div>
    );
  };

  // Função para calcular e formatar o período
  const formatPeriod = () => {
    const startDate = format(parseISO(invoice.invoice_date), "dd/MM/yy");

    if (isSale) {
      return <span>{startDate}</span>;
    }

    const endDate = invoice.return_date
      ? format(parseISO(invoice.return_date), "dd/MM/yy")
      : "-";

    const days = invoice.return_date
      ? differenceInDays(
          parseISO(invoice.return_date),
          parseISO(invoice.invoice_date)
        )
      : 0;

    return (
      <div className="flex flex-col">
        <span>
          {startDate} → {endDate}
        </span>
        <span className="text-xs text-muted-foreground">{days} dias</span>
      </div>
    );
  };

  // Check if notes exist
  const hasNotes = invoice.notes && invoice.notes.trim().length > 0;

  return (
    <TableRow
      className={cn({
        // Cores de fundo no modo claro
        "bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800":
          (invoice.is_paid && invoice.is_returned) ||
          (isSale && invoice.is_paid), // Verde para VENDA paga
        "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700":
          invoice.is_paid && !invoice.is_returned && !isSale, // Amarelo para ALUGUEL pago
        "bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800":
          !invoice.is_paid && !invoice.is_returned, // Vermelho para não pago

        // Borda da fatura atual (current)
        "border-4 shadow-lg": current,
        "border-red-400 dark:border-red-600": current && !invoice.is_paid, // Borda vermelha escura se não estiver paga
        "border-yellow-400 dark:border-yellow-600":
          current && invoice.is_paid && !invoice.is_returned && !isSale, // Borda amarela escura se estiver paga
        "border-green-400 dark:border-green-600":
          (current && invoice.is_paid && invoice.is_returned) ||
          (current && invoice.is_paid && isSale), // Borda verde escura se estiver devolvida
      })}
    >
      <TableCell>{formatClientName(invoice.client_name)}</TableCell>
      <TableCell>{formatPeriod()}</TableCell>
      {/* Coluna para o tipo da fatura */}
      <TableCell>
        <div className="flex items-center space-x-2">
          {invoiceTypeIcon}
          <span>{invoiceTypeText}</span>
        </div>
      </TableCell>

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

      <TableCell className="text-right">
        R$ {formatCurrency(invoice.total)}
      </TableCell>
      <TableCell>
        {invoice.is_paid && (invoice.is_returned || isSale) ? (
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
        {/* Exibe "-" se for VENDA, caso contrário, exibe o toggle de devolução */}
        {isSale ? (
          "-"
        ) : invoice.is_returned ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Switch
            checked={invoice.is_returned}
            onCheckedChange={onToggleReturned}
            disabled={isReturnedDisabled}
          />
        )}
      </TableCell>
      <TableCell>
        <Button
          variant={hasNotes ? "outline" : "ghost"}
          size="icon"
          onClick={onNotesClick}
          title={hasNotes ? "Editar notas" : "Adicionar notas"}
          className="relative"
        >
          <StickyNote
            className={cn(
              "h-4 w-4",
              hasNotes ? "text-blue-500" : "text-muted-foreground"
            )}
          />
          {hasNotes && (
            <AlertOctagon className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
          )}
        </Button>
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
