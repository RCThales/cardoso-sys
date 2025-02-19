import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreditCard, Coins, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
import { QrCodePix } from "qrcode-pix";
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
  const [qrCode, setQrCode] = useState<string>("");
  const [rawPix, setRawPix] = useState<string>("");

  const handleConfirm = () => {
    onConfirm(method);
    onOpenChange(false);
  };

  const getChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - total);
  };

  useEffect(() => {
    async function generateDynamicPix() {
      const qrCodePix = QrCodePix({
        version: "01",
        key: "61981988450",
        name: "57684914 FERNANDO",
        city: "Brasília",
        transactionId: "MULETAS" + Date.now().toString().slice(-6),
        message: "Cardoso Aluguel de Muletas",
        value: total,
      });

      const rawPixStr = qrCodePix.payload();
      const qrCodeBase64 = await qrCodePix.base64();

      setRawPix(rawPixStr);
      setQrCode(qrCodeBase64);
    }

    if (method === "pix" && open) {
      void generateDynamicPix();
    }
  }, [method, total, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forma de Pagamento</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="Cartão" value={method} onValueChange={setMethod}>
          <TabsList className="grid grid-cols-3 gap-4">
            <TabsTrigger value="card">
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão
            </TabsTrigger>
            <TabsTrigger value="Dinheiro">
              <Coins className="h-4 w-4 mr-2" />
              Dinheiro
            </TabsTrigger>
            <TabsTrigger value="Pix">
              <QrCode className="h-4 w-4 mr-2" />
              PIX
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Cartão" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Total a pagar: R$ {formatCurrency(total)}
            </p>
            <Button onClick={handleConfirm} className="w-full">
              Confirmar Pagamento
            </Button>
          </TabsContent>

          <TabsContent value="Dinheiro" className="mt-4 space-y-4">
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

          <TabsContent value="Pix" className="mt-4">
            <div className="flex flex-col items-center space-y-4">
              {qrCode && (
                <img src={qrCode} alt="QR Code PIX" className="w-48 h-48" />
              )}
              <p className="text-sm text-muted-foreground">
                Total a pagar: R$ {formatCurrency(total)}
              </p>
              {rawPix && (
                <div className="w-full">
                  <p className="text-sm font-medium mb-2">Código PIX:</p>
                  <div className="p-2 bg-muted rounded-md text-xs break-all">
                    {rawPix}
                  </div>
                </div>
              )}
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
