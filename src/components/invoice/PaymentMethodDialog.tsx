
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreditCard, Coins, QrCode } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatCurrency } from "@/utils/formatters";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (method: string) => void;
  total: number;
}

export const PaymentMethodDialog = ({
  open,
  onOpenChange,
  onConfirm,
  total,
}: PaymentMethodDialogProps) => {
  const [method, setMethod] = useState<string>("card");
  const [cashReceived, setCashReceived] = useState<string>("");
  
  const handleConfirm = () => {
    onConfirm(method);
    onOpenChange(false);
  };

  const getChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - total);
  };

  const pixKey = "61981988450";
  const pixQRCodeValue = `00020126580014BR.GOV.BCB.PIX0114${pixKey}5204000053039865802BR5913CARDOSO RENT6009SAO PAULO62070503***6304${total.toFixed(2)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forma de Pagamento</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="card" value={method} onValueChange={setMethod}>
          <TabsList className="grid grid-cols-3 gap-4">
            <TabsTrigger value="card">
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão
            </TabsTrigger>
            <TabsTrigger value="cash">
              <Coins className="h-4 w-4 mr-2" />
              Dinheiro
            </TabsTrigger>
            <TabsTrigger value="pix">
              <QrCode className="h-4 w-4 mr-2" />
              PIX
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Total a pagar: R$ {formatCurrency(total)}
            </p>
            <Button onClick={handleConfirm} className="w-full">
              Confirmar Pagamento
            </Button>
          </TabsContent>

          <TabsContent value="cash" className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Valor Recebido:</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="w-full p-2 border rounded-md mt-1"
                placeholder="Digite o valor recebido"
              />
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="flex justify-between mb-2">
                <span>Total:</span>
                <span>R$ {formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Recebido:</span>
                <span>R$ {formatCurrency(parseFloat(cashReceived) || 0)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Troco:</span>
                <span>R$ {formatCurrency(getChange())}</span>
              </div>
            </div>
            <Button 
              onClick={handleConfirm} 
              className="w-full"
              disabled={!cashReceived || parseFloat(cashReceived) < total}
            >
              Confirmar Pagamento
            </Button>
          </TabsContent>

          <TabsContent value="pix" className="mt-4">
            <div className="flex flex-col items-center space-y-4">
              <QRCodeSVG value={pixQRCodeValue} size={200} />
              <p className="text-sm text-muted-foreground">
                Total a pagar: R$ {formatCurrency(total)}
              </p>
              <Button onClick={handleConfirm} className="w-full">
                Confirmar Pagamento
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
