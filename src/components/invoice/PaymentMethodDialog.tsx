
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreditCard, Coins, QrCode, Split, Link, CreditCard as DebitCard } from "lucide-react";
import { useState, useEffect } from "react";
import { QrCodePix } from "qrcode-pix";
import { formatCurrency } from "@/utils/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getSettingByName } from "@/services/settingsService";
import { Label } from "../ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (method: string, installments?: number, splitPayments?: SplitPayment[], noInterest?: boolean) => void;
  total: number;
}

interface SplitPayment {
  method: string;
  amount: number;
  installments?: number;
  noInterest?: boolean;
}

export const PaymentMethodDialog = ({
  open,
  onOpenChange,
  onConfirm,
  total,
}: PaymentMethodDialogProps) => {
  const [method, setMethod] = useState<string>("Cartão");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [rawPix, setRawPix] = useState<string>("");
  const [installments, setInstallments] = useState<number>(1);
  const [installmentFees, setInstallmentFees] = useState<Record<string, number> | null>(null);
  const [linkInstallmentFees, setLinkInstallmentFees] = useState<Record<string, number> | null>(null);
  const [debitFee, setDebitFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [totalWithFee, setTotalWithFee] = useState(total);
  const [noInterest, setNoInterest] = useState(false);
  const [linkInstallments, setLinkInstallments] = useState<number>(1);
  
  const splitForm = useForm({
    defaultValues: {
      firstMethod: "Cartão",
      firstAmount: "",
      firstInstallments: "1",
      firstNoInterest: false,
      secondMethod: "Dinheiro",
      secondAmount: "",
      secondInstallments: "1",
      secondNoInterest: false,
      thirdMethod: "Pix",
      thirdAmount: "",
    }
  });

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        setLoading(true);
        
        // Fetch credit card settings
        const creditCardSetting = await getSettingByName("Cartão de Crédito");
        if (creditCardSetting && creditCardSetting.installments) {
          setInstallmentFees(creditCardSetting.installments);
        }
        
        // Fetch debit card fee
        const debitCardSetting = await getSettingByName("Cartão de Débito");
        if (debitCardSetting) {
          setDebitFee(debitCardSetting.fee);
        }
        
        // Fetch payment link settings
        const linkSetting = await getSettingByName("Link de Pagamento");
        if (linkSetting && linkSetting.installments) {
          setLinkInstallmentFees(linkSetting.installments);
        }
        
        console.log("Fees loaded:", creditCardSetting?.installments);
      } catch (error) {
        console.error("Error fetching payment settings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      void fetchPaymentSettings();
    }
  }, [open]);

  useEffect(() => {
    // Calculate total with fee based on payment method
    if (method === "Cartão" && installmentFees && !noInterest) {
      const fee = installmentFees[installments] || 0;
      const feeAmount = total * (fee / 100);
      setTotalWithFee(total + feeAmount);
    } else if (method === "Cartão de Débito" && !noInterest) {
      const feeAmount = total * (debitFee / 100);
      setTotalWithFee(total + feeAmount);
    } else if (method === "Link de Pagamento" && linkInstallmentFees && !noInterest) {
      const fee = linkInstallmentFees[linkInstallments] || 0;
      const feeAmount = total * (fee / 100);
      setTotalWithFee(total + feeAmount);
    } else {
      setTotalWithFee(total);
    }
  }, [installments, installmentFees, linkInstallments, linkInstallmentFees, method, total, debitFee, noInterest]);

  const handleConfirm = () => {
    onConfirm(
      method, 
      method === "Cartão" ? installments : 
      method === "Link de Pagamento" ? linkInstallments : 
      undefined,
      undefined,
      noInterest
    );
    onOpenChange(false);
  };

  const handleSplitConfirm = () => {
    const values = splitForm.getValues();
    
    const payments: SplitPayment[] = [];
    
    if (parseFloat(values.firstAmount) > 0) {
      payments.push({
        method: values.firstMethod,
        amount: parseFloat(values.firstAmount),
        installments: values.firstMethod === "Cartão" || values.firstMethod === "Link de Pagamento" 
          ? parseInt(values.firstInstallments) 
          : undefined,
        noInterest: values.firstNoInterest
      });
    }
    
    if (parseFloat(values.secondAmount) > 0) {
      payments.push({
        method: values.secondMethod,
        amount: parseFloat(values.secondAmount),
        installments: values.secondMethod === "Cartão" || values.secondMethod === "Link de Pagamento" 
          ? parseInt(values.secondInstallments) 
          : undefined,
        noInterest: values.secondNoInterest
      });
    }
    
    if (parseFloat(values.thirdAmount) > 0) {
      payments.push({
        method: values.thirdMethod,
        amount: parseFloat(values.thirdAmount),
        noInterest: false
      });
    }
    
    onConfirm("Split", undefined, payments);
    onOpenChange(false);
  };

  const getChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - total);
  };

  const calculateSplitRemaining = () => {
    const values = splitForm.getValues();
    const firstAmount = parseFloat(values.firstAmount) || 0;
    const secondAmount = parseFloat(values.secondAmount) || 0;
    const thirdAmount = parseFloat(values.thirdAmount) || 0;
    const totalPaid = firstAmount + secondAmount + thirdAmount;
    return Math.max(0, total - totalPaid);
  };

  // Check if payment methods add up to the total amount
  const isSplitValid = () => {
    return calculateSplitRemaining() === 0;
  };

  useEffect(() => {
    async function generateDynamicPix() {
      try {
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
      } catch (error) {
        console.error("Erro ao gerar QR Code PIX:", error);
      }
    }

    if (method === "Pix" && open) {
      void generateDynamicPix();
    }
  }, [method, total, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Forma de Pagamento</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="Cartão" value={method} onValueChange={setMethod}>
          <TabsList className="grid grid-cols-6 gap-1">
            <TabsTrigger value="Cartão">
              <CreditCard className="h-4 w-4 mr-2" />
              Crédito
            </TabsTrigger>
            <TabsTrigger value="Cartão de Débito">
              <DebitCard className="h-4 w-4 mr-2" />
              Débito
            </TabsTrigger>
            <TabsTrigger value="Dinheiro">
              <Coins className="h-4 w-4 mr-2" />
              Dinheiro
            </TabsTrigger>
            <TabsTrigger value="Pix">
              <QrCode className="h-4 w-4 mr-2" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="Link de Pagamento">
              <Link className="h-4 w-4 mr-2" />
              Link
            </TabsTrigger>
            <TabsTrigger value="Split">
              <Split className="h-4 w-4 mr-2" />
              Dividido
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Cartão" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="installments">Número de Parcelas:</Label>
                <Select 
                  value={installments.toString()} 
                  onValueChange={(value) => setInstallments(parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {installmentFees && Object.keys(installmentFees).map((installment) => (
                      <SelectItem key={installment} value={installment}>
                        {installment}x {!noInterest && installmentFees[installment] ? `(+${installmentFees[installment]}%)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="no-interest"
                  checked={noInterest}
                  onCheckedChange={setNoInterest}
                />
                <Label htmlFor="no-interest">Sem Juros</Label>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Total:</span>
                  <span>R$ {formatCurrency(total)}</span>
                </div>
                
                {installmentFees && installments > 1 && !noInterest && (
                  <div className="flex justify-between mb-2">
                    <span>Taxa ({installmentFees[installments] || 0}%):</span>
                    <span>R$ {formatCurrency((total * ((installmentFees[installments] || 0) / 100)))}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold">
                  <span>Total {!noInterest && totalWithFee > total ? "com taxa" : ""}:</span>
                  <span>R$ {formatCurrency(noInterest ? total : totalWithFee)}</span>
                </div>
                
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>Valor por parcela:</span>
                  <span>R$ {formatCurrency((noInterest ? total : totalWithFee) / installments)}</span>
                </div>
              </div>
              
              <Button onClick={handleConfirm} className="w-full">
                Confirmar Pagamento
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="Cartão de Débito" className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="debit-no-interest"
                checked={noInterest}
                onCheckedChange={setNoInterest}
              />
              <Label htmlFor="debit-no-interest">Sem Juros</Label>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <div className="flex justify-between mb-2">
                <span>Total:</span>
                <span>R$ {formatCurrency(total)}</span>
              </div>
              
              {!noInterest && debitFee > 0 && (
                <div className="flex justify-between mb-2">
                  <span>Taxa ({debitFee}%):</span>
                  <span>R$ {formatCurrency((total * (debitFee / 100)))}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold">
                <span>Total {!noInterest && debitFee > 0 ? "com taxa" : ""}:</span>
                <span>R$ {formatCurrency(noInterest ? total : totalWithFee)}</span>
              </div>
            </div>
            <Button onClick={handleConfirm} className="w-full">
              Confirmar Pagamento com Débito
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
              {qrCode ? (
                <img src={qrCode} alt="QR Code PIX" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 flex items-center justify-center text-muted-foreground">
                  Gerando QR Code...
                </div>
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

          <TabsContent value="Link de Pagamento" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="link-installments">Número de Parcelas:</Label>
              <Select 
                value={linkInstallments.toString()} 
                onValueChange={(value) => setLinkInstallments(parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione parcelas" />
                </SelectTrigger>
                <SelectContent>
                  {linkInstallmentFees && Object.keys(linkInstallmentFees).map((installment) => (
                    <SelectItem key={installment} value={installment}>
                      {installment}x {!noInterest && linkInstallmentFees[installment] ? `(+${linkInstallmentFees[installment]}%)` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="link-no-interest"
                checked={noInterest}
                onCheckedChange={setNoInterest}
              />
              <Label htmlFor="link-no-interest">Sem Juros</Label>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <div className="flex justify-between mb-2">
                <span>Total:</span>
                <span>R$ {formatCurrency(total)}</span>
              </div>
              
              {linkInstallmentFees && linkInstallments > 1 && !noInterest && (
                <div className="flex justify-between mb-2">
                  <span>Taxa ({linkInstallmentFees[linkInstallments] || 0}%):</span>
                  <span>R$ {formatCurrency((total * ((linkInstallmentFees[linkInstallments] || 0) / 100)))}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold">
                <span>Total {!noInterest && totalWithFee > total ? "com taxa" : ""}:</span>
                <span>R$ {formatCurrency(noInterest ? total : totalWithFee)}</span>
              </div>
              
              {linkInstallments > 1 && (
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>Valor por parcela:</span>
                  <span>R$ {formatCurrency((noInterest ? total : totalWithFee) / linkInstallments)}</span>
                </div>
              )}
              
              <p className="text-sm mt-2">
                Um link de pagamento será enviado ao cliente para processamento.
              </p>
            </div>
            <Button onClick={handleConfirm} className="w-full">
              Gerar Link de Pagamento
            </Button>
          </TabsContent>

          <TabsContent value="Split" className="mt-4">
            <Form {...splitForm}>
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-md mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Total da Fatura:</span>
                    <span>R$ {formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Restante a pagar:</span>
                    <span>R$ {formatCurrency(calculateSplitRemaining())}</span>
                  </div>
                </div>

                {/* First Payment Method */}
                <div className="space-y-3 border-b pb-4">
                  <h3 className="font-medium">Primeiro Método</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={splitForm.control}
                      name="firstMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Cartão">Cartão de Crédito</SelectItem>
                              <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="Pix">PIX</SelectItem>
                              <SelectItem value="Link de Pagamento">Link de Pagamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitForm.control}
                      name="firstAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Force form to update
                                splitForm.trigger();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {(splitForm.watch("firstMethod") === "Cartão" || splitForm.watch("firstMethod") === "Link de Pagamento") && (
                    <>
                      <FormField
                        control={splitForm.control}
                        name="firstInstallments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parcelas</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[...Array(12)].map((_, i) => (
                                  <SelectItem key={i+1} value={(i+1).toString()}>{i+1}x</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={splitForm.control}
                        name="firstNoInterest"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Sem Juros</FormLabel>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                {/* Second Payment Method */}
                <div className="space-y-3 border-b pb-4">
                  <h3 className="font-medium">Segundo Método</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={splitForm.control}
                      name="secondMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Cartão">Cartão de Crédito</SelectItem>
                              <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="Pix">PIX</SelectItem>
                              <SelectItem value="Link de Pagamento">Link de Pagamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitForm.control}
                      name="secondAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                splitForm.trigger();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {(splitForm.watch("secondMethod") === "Cartão" || splitForm.watch("secondMethod") === "Link de Pagamento") && (
                    <>
                      <FormField
                        control={splitForm.control}
                        name="secondInstallments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parcelas</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[...Array(12)].map((_, i) => (
                                  <SelectItem key={i+1} value={(i+1).toString()}>{i+1}x</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={splitForm.control}
                        name="secondNoInterest"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Sem Juros</FormLabel>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                {/* Third Payment Method */}
                <div className="space-y-3">
                  <h3 className="font-medium">Terceiro Método</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={splitForm.control}
                      name="thirdMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Cartão">Cartão de Crédito</SelectItem>
                              <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="Pix">PIX</SelectItem>
                              <SelectItem value="Link de Pagamento">Link de Pagamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitForm.control}
                      name="thirdAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                splitForm.trigger();
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSplitConfirm} 
                  className="w-full" 
                  disabled={!isSplitValid()}
                >
                  Confirmar Pagamento Dividido
                </Button>
              </div>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
