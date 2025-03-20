import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Invoice } from "./types";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { ReturnConfirmDialog } from "./ReturnConfirmDialog";
import { PaymentMethodDialog } from "./PaymentMethodDialog";
import { DeleteInvoiceDialog } from "./DeleteInvoiceDialog";
import { NotesDialog } from "./NotesDialog";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import { InvoiceTableHeader } from "./table/InvoiceTableHeader";
import { InvoiceTableRow } from "./table/InvoiceTableRow";
import { returnToInventory } from "@/services/inventoryService";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button"; // Importe o componente de botão

interface InvoiceTableProps {
  invoices: Invoice[];
  onTogglePaid: (
    invoiceId: number,
    currentStatus: boolean,
    method?: string
  ) => void;
  onToggleReturned: (invoiceId: number, currentStatus: boolean) => void;
  onDownload: (invoice: Invoice) => void;
  onPreview: (invoice: Invoice) => void;
  onDelete: (invoiceId: number) => void;
  formatCurrency: (value: number) => string;
  invoiceId?: string | null;
  onRefresh: () => void;
  filterType: "all" | "rental" | "sale" | "hybrid";
}

export const InvoiceTable = ({
  invoices,
  onTogglePaid,
  onToggleReturned,
  onDownload,
  onPreview,
  onDelete,
  formatCurrency,
  invoiceId,
  onRefresh,
  filterType,
}: InvoiceTableProps) => {
  const { toast } = useToast();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10; // Quantidade de itens por página
  const { width, height } = useWindowSize();

  // Função para determinar o tipo da fatura (VENDA, ALUGUEL ou HÍBRIDO)
  const getInvoiceType = (
    invoice: Invoice
  ): "VENDA" | "ALUGUEL" | "HÍBRIDO" => {
    const filteredItems = invoice.items.filter(
      (item) => item.productId !== "delivery-fee"
    );
    const allSales = filteredItems.every((item) => item.is_sale);
    const allRentals = filteredItems.every((item) => !item.is_sale);

    if (allSales) {
      return "VENDA";
    } else if (allRentals) {
      return "ALUGUEL";
    } else {
      return "HÍBRIDO";
    }
  };

  // Encontra a fatura atual com base no invoiceId
  const currentInvoice = invoiceId
    ? invoices.find((invoice) => invoice.invoice_number === invoiceId)
    : null;

  const filteredCurrentInvoice =
    currentInvoice &&
    (filterType === "all" ||
      getInvoiceType(currentInvoice) ===
        (filterType === "rental"
          ? "ALUGUEL"
          : filterType === "sale"
          ? "VENDA"
          : filterType === "hybrid"
          ? "HÍBRIDO"
          : "all"))
      ? currentInvoice
      : null;

  // Filtra as faturas excluindo a fatura atual (se existir)
  const otherInvoices = invoiceId
    ? invoices.filter((invoice) => invoice.invoice_number !== invoiceId)
    : invoices;

  const filteredInvoices = otherInvoices.filter((invoice) => {
    const type = getInvoiceType(invoice);
    return (
      filterType === "all" ||
      (filterType === "rental" && type === "ALUGUEL") ||
      (filterType === "sale" && type === "VENDA") ||
      (filterType === "hybrid" && type === "HÍBRIDO")
    );
  });

  // Paginação: pega os 10 itens correspondentes à página atual
  const paginatedInvoices = filteredInvoices.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Controle de páginas
  const totalPages = Math.ceil(filteredInvoices.length / pageSize);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePaymentToggle = (invoice: Invoice) => {
    if (invoice.is_paid) {
      onTogglePaid(invoice.id, invoice.is_paid);
      return;
    }

    if (invoice.is_returned) {
      toast({
        title: "Ação não permitida",
        description:
          "Não é possível alterar o status de pagamento após a devolução",
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

  const handleConfirmReturn = async () => {
    if (selectedInvoice) {
      try {
        await returnToInventory(selectedInvoice.items);
        await onToggleReturned(selectedInvoice.id, selectedInvoice.is_returned);
        setReturnDialogOpen(false);
        setSelectedInvoice(null);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar o estoque",
          variant: "destructive",
        });
      }
    }
  };

  const handleNotesClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNotesDialogOpen(true);
  };

  return (
    <>
      {showConfetti && (
        <ReactConfetti width={width} height={height} recycle={false} />
      )}
      <Table>
        <InvoiceTableHeader />
        <TableBody>
          {/* Exibe a fatura atual destacada se ela passar no filtro */}
          {filteredCurrentInvoice && (
            <InvoiceTableRow
              key={filteredCurrentInvoice.id}
              current={true}
              invoice={filteredCurrentInvoice}
              invoiceType={getInvoiceType(filteredCurrentInvoice)}
              onTogglePaid={() => handlePaymentToggle(filteredCurrentInvoice)}
              onToggleReturned={() =>
                handleReturnedToggle(filteredCurrentInvoice)
              }
              onDownload={() => onDownload(filteredCurrentInvoice)}
              onPreview={() => onPreview(filteredCurrentInvoice)}
              onDelete={() => handleDeleteClick(filteredCurrentInvoice)}
              onNotesClick={() => handleNotesClick(filteredCurrentInvoice)}
              formatCurrency={formatCurrency}
              isPaidDisabled={filteredCurrentInvoice.is_returned}
              isReturnedDisabled={
                !filteredCurrentInvoice.is_paid ||
                filteredCurrentInvoice.is_returned
              }
            />
          )}

          {/* Exibe as outras faturas filtradas e paginadas */}
          {paginatedInvoices.length > 0 ? (
            paginatedInvoices.map((invoice) => (
              <InvoiceTableRow
                key={invoice.id}
                current={false}
                invoice={invoice}
                invoiceType={getInvoiceType(invoice)}
                onTogglePaid={() => handlePaymentToggle(invoice)}
                onToggleReturned={() => handleReturnedToggle(invoice)}
                onDownload={() => onDownload(invoice)}
                onPreview={() => onPreview(invoice)}
                onDelete={() => handleDeleteClick(invoice)}
                onNotesClick={() => handleNotesClick(invoice)}
                formatCurrency={formatCurrency}
                isPaidDisabled={invoice.is_returned}
                isReturnedDisabled={!invoice.is_paid || invoice.is_returned}
              />
            ))
          ) : (
            // Se não houver faturas após o filtro, exibe uma mensagem
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                Nenhuma fatura encontrada para este filtro.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Controles de Paginação */}
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          variant="outline"
        >
          Anterior
        </Button>
        <span>
          Página {currentPage + 1} de {totalPages}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
          variant="outline"
        >
          Próxima
        </Button>
      </div>

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

      <NotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        invoiceId={selectedInvoice?.id || 0}
        initialNotes={selectedInvoice?.notes || ""}
        onNotesSaved={onRefresh}
      />
    </>
  );
};
