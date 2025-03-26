
import { format, parseISO, differenceInDays } from "date-fns";
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
import { Tag, Calendar, Truck, CreditCard, Percent } from "lucide-react";
import { usePaymentSettingsStore } from "@/store/paymentSettingsStore";
import { useEffect } from "react";

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
  const { fetchSettings, getFeeByMethod } = usePaymentSettingsStore();
  
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  if (!invoice) return null;
  
  // Calcular o período e dias para mostrar na visualização
  const startDate = format(parseISO(invoice.invoice_date), "dd/MM/yyyy");
  const endDate = invoice.return_date 
    ? format(parseISO(invoice.return_date), "dd/MM/yyyy") 
    : "-";
  const days = invoice.return_date 
    ? differenceInDays(parseISO(invoice.return_date), parseISO(invoice.invoice_date))
    : 0;

  // Calcular o subtotal (sem taxa de pagamento)
  const itemsTotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const subtotalWithoutFee = itemsTotal;
  
  // Get actual fee percentage from payment settings if available
  const getActualFeePercentage = () => {
    if (!invoice.payment_method) return 0;
    
    // Extract installment number if present in the payment_method
    const methodParts = invoice.payment_method.split('_');
    const installments = methodParts.length > 1 && !isNaN(Number(methodParts[1])) 
      ? Number(methodParts[1]) 
      : 1;
    
    const baseMethod = methodParts[0];
    return getFeeByMethod(baseMethod, installments);
  };
  
  // Use either the actual fee from settings or the stored fee
  const feePercentage = getActualFeePercentage() || invoice.payment_fee || 0;
  
  // Calcular o valor da taxa de pagamento (percentual do subtotal)
  const feeAmount = (subtotalWithoutFee * feePercentage) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Visualizar Fatura</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-x-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Cliente</h3>
              <p>{invoice.client_name}</p>
              <p>CPF: {invoice.client_cpf}</p>
              <p>Tel: {invoice.client_phone}</p>
              <p>
                {invoice.client_address}
                {invoice.client_address_number
                  ? `, ${invoice.client_address_number}`
                  : ""}
              </p>
              {invoice.client_address_complement && (
                <p>{invoice.client_address_complement}</p>
              )}
              <p>
                {invoice.client_city} - {invoice.client_state}
              </p>
              <p>{invoice.client_postal_code}</p>
            </div>
            <div>
              <h3 className="font-semibold">Detalhes da Fatura</h3>
              <p>Nº: {invoice.invoice_number}</p>
              <p>
                Período: {startDate} {invoice.return_date ? `→ ${endDate}` : ""}
              </p>
              {invoice.return_date && <p>Duração: {days} dias</p>}
              <p>Status: {invoice.is_paid ? "Pago" : "Pendente"}</p>
              {invoice.is_paid && invoice.payment_method && (
                <div>
                  <p className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Forma de Pagamento: {invoice.payment_method.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Itens</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => {
                  // Skip delivery fee items with zero value
                  if (item.productId === "delivery-fee" && item.total === 0) {
                    return null;
                  }
                  
                  const description = item.size
                    ? `${item.description} (${item.size})`
                    : item.description;

                  // Verifica se o item é uma taxa de entrega (delivery-fee)
                  const isDeliveryFee = item.productId === "delivery-fee";

                  // Determina o tipo do item (VENDA, ALUGUEL ou TRANSPORTE)
                  const itemType = isDeliveryFee
                    ? "Transporte"
                    : item.is_sale
                    ? "VENDA"
                    : "ALUGUEL";
                  const itemIcon = isDeliveryFee ? (
                    <Truck className="h-4 w-4 text-gray-500" /> // Ícone de transporte
                  ) : item.is_sale ? (
                    <Tag className="h-4 w-4 text-blue-500" /> // Ícone de venda
                  ) : (
                    <Calendar className="h-4 w-4 text-green-500" /> // Ícone de aluguel
                  );

                  // Exibe "-" para Dias se for VENDA ou Transporte
                  const daysDisplay =
                    isDeliveryFee || item.is_sale ? "-" : item.rentalDays;

                  // Exibe "-" para Quantidade se for Transporte
                  const quantityDisplay = isDeliveryFee ? "-" : item.quantity;

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {itemIcon}
                          <span>{itemType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{description}</TableCell>
                      <TableCell>{daysDisplay}</TableCell>
                      <TableCell>{quantityDisplay}</TableCell>
                      <TableCell className="text-right">
                        R$ {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Adiciona a linha para a taxa de pagamento se existir */}
                {invoice.payment_fee && invoice.payment_fee > 0 && (
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Percent className="h-4 w-4 text-orange-500" />
                        <span>Taxa</span>
                      </div>
                    </TableCell>
                    <TableCell>Taxa de pagamento ({feePercentage.toFixed(2)}%)</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">
                      R$ {formatCurrency(feeAmount)}
                    </TableCell>
                  </TableRow>
                )}
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
                    <TableHead className="text-right">
                      Custo Adicional
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.extensions.map((extension, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {format(parseISO(extension.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{extension.days}</TableCell>
                      <TableCell className="text-right">
                        R$ {formatCurrency(extension.additionalCost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">
              Subtotal: R$ {formatCurrency(subtotalWithoutFee)}
            </p>
            {invoice.payment_fee && invoice.payment_fee > 0 && (
              <p className="text-sm text-muted-foreground">
                Taxa de pagamento ({feePercentage.toFixed(2)}%): R$ {formatCurrency(feeAmount)}
              </p>
            )}
            <p className="font-semibold">
              Total: R$ {formatCurrency(invoice.total)}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => onDownload(invoice)}>Baixar PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
