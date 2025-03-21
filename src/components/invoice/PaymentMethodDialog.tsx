import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  CreditCard,
  Coins,
  QrCode,
  Split,
  Link as LinkIcon,
  CreditCard as DebitCard,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { QrCodePix } from "qrcode-pix";
import { formatCurrency } from "@/utils/formatters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getSettingByName } from "@/services/settingsService";
import { Label } from "../ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    method: string,
    installments?: number,
    splitPayments?: SplitPayment[],
    noInterest?: boolean
  ) => void;
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
  const [method, setMethod] = useState<string>("credito");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [rawPix, setRawPix] = useState<string>("");
  const [installments, setInstallments] = useState<number>(1);
  const [installmentFees, setInstallmentFees] = useState<Record<
    string,
    number
  > | null>(null);
  const [linkInstallmentFees, setLinkInstallmentFees] = useState<Record<
    string,
    number
  > | null>(null);
  const [debitFee, setDebitFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [totalWithFee, setTotalWithFee] = useState(total);
  const [noInterest, setNoInterest] = useState(false);
  const [linkInstallments, setLinkInstallments] = useState<number>(1);

  const splitForm = useForm({
    defaultValues: {
      splitPayments: [
        { method: "credito", amount: "", installments: "1", noInterest: false },
        {
          method: "dinheiro",
          amount: "",
          installments: "1",
          noInterest: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: splitForm.control,
    name: "splitPayments",
  });

  const paymentMethods = [
    {
      value: "credito",
      label: "Cartão de Crédito",
      icon: <CreditCard className="h-4 w-4 mr-2" />,
    },
    {
      value: "debito",
      label: "Cartão de Débito",
      icon: <DebitCard className="h-4 w-4 mr-2" />,
    },
    {
      value: "dinheiro",
      label: "Dinheiro",
      icon: <Coins className="h-4 w-4 mr-2" />,
    },
    { value: "pix", label: "PIX", icon: <QrCode className="h-4 w-4 mr-2" /> },
    {
      value: "link",
      label: "Link de Pagamento",
      icon: <LinkIcon className="h-4 w-4 mr-2" />,
    },
  ];

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
        const linkSetting = await getSettingByName("Link");
        if (linkSetting && linkSetting.installments) {
          setLinkInstallmentFees(linkSetting.installments);
        } else {
          // If no specific Link settings found, fallback to credit card settings
          setLinkInstallmentFees(creditCardSetting?.installments || null);
        }
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
    if (method === "credito" && installmentFees && !noInterest) {
      const fee = installmentFees[installments] || 0;
      const feeAmount = total * (fee / 100);
      setTotalWithFee(total - feeAmount);
    } else if (method === "debito" && !noInterest) {
      const feeAmount = total * (debitFee / 100);
      setTotalWithFee(total - feeAmount);
    } else if (method === "link" && linkInstallmentFees && !noInterest) {
      const fee = linkInstallmentFees[linkInstallments] || 0;
      const feeAmount = total * (fee / 100);
      setTotalWithFee(total - feeAmount);
    } else {
      setTotalWithFee(total);
    }
  }, [
    installments,
    installmentFees,
    linkInstallments,
    linkInstallmentFees,
    method,
    total,
    debitFee,
    noInterest,
  ]);

  const handleConfirm = () => {
    console.log(debitFee);
    onConfirm(
      method,
      method === "credito"
        ? installments
        : method === "link"
        ? linkInstallments
        : method === "debito"
        ? debitFee
        : undefined,
      undefined,
      noInterest
    );
    onOpenChange(false);
  };

  const handleSplitConfirm = () => {
    const values = splitForm.getValues();

    const payments: SplitPayment[] = values.splitPayments
      .filter((payment) => parseFloat(payment.amount as string) > 0)
      .map((payment) => ({
        method: payment.method,
        amount: parseFloat(payment.amount as string),
        installments:
          payment.method === "credito" || payment.method === "link"
            ? parseInt(payment.installments as string)
            : undefined,
        noInterest: payment.noInterest,
      }));

    onConfirm("Split", undefined, payments);
    onOpenChange(false);
  };

  const getChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - total);
  };

  const calculateSplitTotalWithFees = () => {
    const values = splitForm.getValues();
    let totalWithFees = 0;

    // Sum the payment amounts with their respective fees
    values.splitPayments.forEach((payment) => {
      const amount = parseFloat(payment.amount as string) || 0;
      if (amount > 0) {
        const installmentCount = parseInt(payment.installments as string) || 1;
        const noInterestOption = payment.noInterest === true;

        // Calculate with fee if applicable
        if (!noInterestOption) {
          const fee = calculateSplitFee(
            payment.method,
            amount,
            installmentCount,
            noInterestOption
          );
          totalWithFees += amount - fee;
        } else {
          totalWithFees += amount;
        }
      }
    });

    return totalWithFees;
  };

  const calculateSplitRemaining = () => {
    const totalWithFees = calculateSplitTotalWithFees();
    return Math.max(0, total - totalWithFees);
  };

  // Calculate fee amount for a method in split payment
  const calculateSplitFee = (
    method: string,
    amount: number,
    installments: number,
    noInterest: boolean
  ): number => {
    if (noInterest) return 0;

    if (method === "credito" && installmentFees) {
      return (amount * (installmentFees[installments] || 0)) / 100;
    } else if (method === "debito") {
      return (amount * (debitFee || 0)) / 100;
    } else if (method === "link" && linkInstallmentFees) {
      return (amount * (linkInstallmentFees[installments] || 0)) / 100;
    }

    return 0;
  };

  // Check if payment methods add up to the total amount
  const isSplitValid = () => {
    return calculateSplitRemaining() <= 0;
  };

  // Check if method can be added (credit card and debit card can be used multiple times)
  const canAddMethod = (method: string) => {
    const values = splitForm.getValues();
    const methodsInUse = values.splitPayments.map((p) => p.method);

    // Return true if credit card or debit card
    if (method === "credito" || method === "debito") {
      return true;
    }

    // For other methods, check if already in use
    return !methodsInUse.includes(method);
  };

  // Get available payment methods for adding
  const getAvailableMethods = () => {
    return paymentMethods.filter((method) => canAddMethod(method.value));
  };

  const addPaymentMethod = () => {
    // Find first available method
    const availableMethods = getAvailableMethods();
    if (availableMethods.length > 0) {
      append({
        method: availableMethods[0].value,
        amount: "",
        installments: "1",
        noInterest: false,
      });
    }
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

    if (method === "pix" && open) {
      void generateDynamicPix();
    }
  }, [method, total, open]);

  // Render method icon based on method name
  const renderMethodIcon = (methodName: string) => {
    switch (methodName) {
      case "credito":
        return <CreditCard className="h-4 w-4" />;
      case "debito":
        return <DebitCard className="h-4 w-4" />;
      case "dinheiro":
        return <Coins className="h-4 w-4" />;
      case "pix":
        return <QrCode className="h-4 w-4" />;
      case "link":
        return <LinkIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Get method label from value
  const getMethodLabel = (methodValue: string): string => {
    const method = paymentMethods.find((m) => m.value === methodValue);
    return method ? method.label : methodValue;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[620px] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Forma de Pagamento</DialogTitle>
          <DialogDescription>
            Selecione o método de pagamento da fatura
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="p-1">
            <Tabs
              defaultValue="credito"
              value={method}
              onValueChange={setMethod}
            >
              <TabsList className="grid grid-cols-3 gap-2 mb-4 w-full">
                <TabsTrigger
                  value="credito"
                  className="flex  items-center justify-center  text-center"
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  <span className="text-xs">Crédito</span>
                </TabsTrigger>
                <TabsTrigger
                  value="debito"
                  className="flex  items-center justify-center  text-center"
                >
                  <DebitCard className="h-4 w-4 mr-1" />
                  <span className="text-xs">Débito</span>
                </TabsTrigger>
                <TabsTrigger
                  value="link"
                  className="flex  items-center justify-center  text-center"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">Link</span>
                </TabsTrigger>
              </TabsList>

              <TabsList className="grid grid-cols-3 gap-4 mb-4 w-full">
                <TabsTrigger
                  value="dinheiro"
                  className="flex  items-center justify-center  text-center"
                >
                  <Coins className="h-4 w-4 mr-1" />
                  <span className="text-xs">Dinheiro</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pix"
                  className="flex  items-center justify-center text-center"
                >
                  <QrCode className="h-4 w-4 mr-1" />
                  <span className="text-xs">PIX</span>
                </TabsTrigger>
                <TabsTrigger
                  value="split"
                  className="flex  items-center justify-center text-center"
                >
                  <Split className="h-4 w-4 mr-1" />
                  <span className="text-xs">Dividido</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="credito" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="installments">Número de Parcelas:</Label>
                      <Select
                        value={installments.toString()}
                        onValueChange={(value) =>
                          setInstallments(parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecione parcelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {installmentFees &&
                            Object.keys(installmentFees).map((installment) => (
                              <SelectItem key={installment} value={installment}>
                                {installment}x{" "}
                                {!noInterest && installmentFees[installment]
                                  ? `(+${installmentFees[installment]}%)`
                                  : ""}
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
                          <span>
                            Taxa ({installmentFees[installments] || 0}%):
                          </span>
                          <span>
                            R${" "}
                            {formatCurrency(
                              total *
                                ((installmentFees[installments] || 0) / 100)
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold">
                        <span>
                          Total{" "}
                          {!noInterest && totalWithFee > total
                            ? "com taxa"
                            : ""}
                          :
                        </span>
                        <span>
                          R$ {formatCurrency(noInterest ? total : totalWithFee)}
                        </span>
                      </div>

                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>Valor por parcela:</span>
                        <span>
                          R${" "}
                          {formatCurrency(
                            (noInterest ? total : totalWithFee) / installments
                          )}
                        </span>
                      </div>
                    </div>

                    <Button onClick={handleConfirm} className="w-full">
                      Confirmar Pagamento
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="debito" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
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
                          <span>
                            R$ {formatCurrency(total * (debitFee / 100))}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold">
                        <span>
                          Total {!noInterest && debitFee > 0 ? "com taxa" : ""}:
                        </span>
                        <span>
                          R$ {formatCurrency(noInterest ? total : totalWithFee)}
                        </span>
                      </div>
                    </div>
                    <Button onClick={handleConfirm} className="w-full">
                      Confirmar Pagamento com Débito
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dinheiro" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Valor Recebido:
                      </label>
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
                        <span>
                          R$ {formatCurrency(parseFloat(cashReceived) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Troco:</span>
                        <span>R$ {formatCurrency(getChange())}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleConfirm}
                      className="w-full"
                      disabled={
                        !cashReceived || parseFloat(cashReceived) < total
                      }
                    >
                      Confirmar Pagamento
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pix" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-4">
                      {qrCode ? (
                        <img
                          src={qrCode}
                          alt="QR Code PIX"
                          className="w-48 h-48"
                        />
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
                          <p className="text-sm font-medium mb-2">
                            Código PIX:
                          </p>
                          <div className="p-2 bg-muted rounded-md text-xs break-all">
                            {rawPix}
                          </div>
                        </div>
                      )}
                      <Button onClick={handleConfirm} className="w-full">
                        Confirmar Pagamento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="link" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="link-installments">
                        Número de Parcelas:
                      </Label>
                      <Select
                        value={linkInstallments.toString()}
                        onValueChange={(value) =>
                          setLinkInstallments(parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecione parcelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {linkInstallmentFees
                            ? Object.keys(linkInstallmentFees).map(
                                (installment) => (
                                  <SelectItem
                                    key={installment}
                                    value={installment}
                                  >
                                    {installment}x{" "}
                                    {!noInterest &&
                                    linkInstallmentFees[installment]
                                      ? `(+${linkInstallmentFees[installment]}%)`
                                      : ""}
                                  </SelectItem>
                                )
                              )
                            : // Fallback to standard installments if no specific fees
                              installmentFees &&
                              Object.keys(installmentFees).map(
                                (installment) => (
                                  <SelectItem
                                    key={installment}
                                    value={installment}
                                  >
                                    {installment}x{" "}
                                    {!noInterest && installmentFees[installment]
                                      ? `(+${installmentFees[installment]}%)`
                                      : ""}
                                  </SelectItem>
                                )
                              )}
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

                      {linkInstallmentFees &&
                        linkInstallments > 1 &&
                        !noInterest && (
                          <div className="flex justify-between mb-2">
                            <span>
                              Taxa ({linkInstallmentFees[linkInstallments] || 0}
                              %):
                            </span>
                            <span>
                              R${" "}
                              {formatCurrency(
                                total *
                                  ((linkInstallmentFees[linkInstallments] ||
                                    0) /
                                    100)
                              )}
                            </span>
                          </div>
                        )}

                      <div className="flex justify-between font-bold">
                        <span>
                          Total{" "}
                          {!noInterest && totalWithFee > total
                            ? "com taxa"
                            : ""}
                          :
                        </span>
                        <span>
                          R$ {formatCurrency(noInterest ? total : totalWithFee)}
                        </span>
                      </div>

                      {linkInstallments > 1 && (
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>Valor por parcela:</span>
                          <span>
                            R${" "}
                            {formatCurrency(
                              (noInterest ? total : totalWithFee) /
                                linkInstallments
                            )}
                          </span>
                        </div>
                      )}

                      <p className="text-sm mt-2">
                        Um link de pagamento será enviado ao cliente para
                        processamento.
                      </p>
                    </div>
                    <Button onClick={handleConfirm} className="w-full">
                      Gerar Link de Pagamento
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="split" className="mt-4">
                <Form {...splitForm}>
                  <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-md mb-4">
                      <div className="flex justify-between mb-2">
                        <span>Total da Fatura:</span>
                        <span>R$ {formatCurrency(total)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Total com Taxas:</span>
                        <span>
                          R$ {formatCurrency(calculateSplitTotalWithFees())}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Restante a pagar:</span>
                        <span>
                          R$ {formatCurrency(calculateSplitRemaining())}
                        </span>
                      </div>
                    </div>

                    <ScrollArea className="h-[360px] md:h-[400px] pr-4">
                      <div className="space-y-6">
                        {fields.map((field, index) => {
                          const currentMethod = splitForm.watch(
                            `splitPayments.${index}.method`
                          );
                          const currentAmount =
                            parseFloat(
                              splitForm.watch(
                                `splitPayments.${index}.amount`
                              ) as string
                            ) || 0;
                          const currentInstallments =
                            parseInt(
                              splitForm.watch(
                                `splitPayments.${index}.installments`
                              ) as string
                            ) || 1;
                          const currentNoInterest = splitForm.watch(
                            `splitPayments.${index}.noInterest`
                          );

                          // Calculate the fee for this payment method
                          const feeAmount = calculateSplitFee(
                            currentMethod,
                            currentAmount,
                            currentInstallments,
                            currentNoInterest
                          );

                          return (
                            <Card key={field.id} className="overflow-hidden">
                              <CardContent className="p-4 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                  <div className="flex items-center gap-2">
                                    {renderMethodIcon(currentMethod)}
                                    <h3 className="font-medium">
                                      {getMethodLabel(currentMethod)}
                                    </h3>
                                  </div>
                                  {fields.length > 2 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <FormField
                                    control={splitForm.control}
                                    name={`splitPayments.${index}.method`}
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
                                            {paymentMethods.map(
                                              (method) =>
                                                (method.value === field.value ||
                                                  canAddMethod(
                                                    method.value
                                                  )) && (
                                                  <SelectItem
                                                    key={method.value}
                                                    value={method.value}
                                                  >
                                                    <div className="flex items-center">
                                                      {method.icon}
                                                      {method.label}
                                                    </div>
                                                  </SelectItem>
                                                )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={splitForm.control}
                                    name={`splitPayments.${index}.amount`}
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

                                {(currentMethod === "credito" ||
                                  currentMethod === "link") && (
                                  <div className="mt-3">
                                    <FormField
                                      control={splitForm.control}
                                      name={`splitPayments.${index}.installments`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Parcelas</FormLabel>
                                          <Select
                                            value={field.value as string}
                                            onValueChange={field.onChange}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {currentMethod === "credito" &&
                                              installmentFees
                                                ? Object.keys(
                                                    installmentFees
                                                  ).map((i) => (
                                                    <SelectItem
                                                      key={i}
                                                      value={i}
                                                    >
                                                      {i}x{" "}
                                                      {!currentNoInterest
                                                        ? `(+${installmentFees[i]}%)`
                                                        : ""}
                                                    </SelectItem>
                                                  ))
                                                : currentMethod === "link" &&
                                                  linkInstallmentFees
                                                ? Object.keys(
                                                    linkInstallmentFees
                                                  ).map((i) => (
                                                    <SelectItem
                                                      key={i}
                                                      value={i}
                                                    >
                                                      {i}x{" "}
                                                      {!currentNoInterest
                                                        ? `(+${linkInstallmentFees[i]}%)`
                                                        : ""}
                                                    </SelectItem>
                                                  ))
                                                : [...Array(12)].map((_, i) => (
                                                    <SelectItem
                                                      key={i + 1}
                                                      value={(i + 1).toString()}
                                                    >
                                                      {i + 1}x
                                                    </SelectItem>
                                                  ))}
                                            </SelectContent>
                                          </Select>
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={splitForm.control}
                                      name={`splitPayments.${index}.noInterest`}
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 mt-3">
                                          <FormControl>
                                            <Switch
                                              checked={field.value as boolean}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            Sem Juros
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                )}

                                {/* Show fee if applicable */}
                                {feeAmount > 0 &&
                                  currentAmount > 0 &&
                                  !currentNoInterest && (
                                    <div className="mt-3 p-2 bg-muted/40 rounded text-sm">
                                      <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal:</span>
                                        <span>
                                          R$ {formatCurrency(currentAmount)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-muted-foreground">
                                        <span>Taxa:</span>
                                        <span>
                                          R$ {formatCurrency(feeAmount)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between font-medium mt-1 pt-1 border-t border-border">
                                        <span>Total:</span>
                                        <span>
                                          R${" "}
                                          {formatCurrency(
                                            currentAmount - feeAmount
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    <div className="flex flex-col space-y-3 pt-2">
                      {getAvailableMethods().length > 0 && (
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center"
                          onClick={addPaymentMethod}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Forma de Pagamento
                        </Button>
                      )}

                      <Button
                        onClick={handleSplitConfirm}
                        className="w-full"
                        disabled={!isSplitValid()}
                      >
                        Confirmar Pagamento Dividido
                      </Button>
                    </div>
                  </div>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
