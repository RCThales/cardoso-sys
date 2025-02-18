
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CompanyHeader } from "./invoice/CompanyHeader";
import { ClientForm } from "./invoice/ClientForm";
import { InvoiceItems } from "./invoice/InvoiceItems";
import { useInvoiceGeneration } from "@/hooks/useInvoiceGeneration";
import { Input } from "./ui/input";

export const InvoiceGenerator = () => {
  const {
    items,
    clientData,
    setClientData,
    addItem,
    updateItem,
    removeItem,
    calculateSubtotal,
    generateInvoice,
  } = useInvoiceGeneration();

  const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  const handleDeliveryFeeChange = (value: string) => {
    setClientData({
      ...clientData,
      deliveryFee: Number(value) || 0,
    });
  };

  const itemsSubtotal = items.reduce((sum, item) => {
    const itemTotal = typeof item.total === 'number' ? item.total : 0;
    return sum + itemTotal;
  }, 0);

  return (
    <Card className="p-6">
      <CompanyHeader />

      <div className="space-y-6">
        <ClientForm
          clientData={clientData}
          onClientDataChange={setClientData}
        />

        <InvoiceItems
          items={items}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Subtotal:</span>
            <span>R$ {formatCurrency(itemsSubtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <label className="font-medium" htmlFor="deliveryFee">
              Frete:
            </label>
            <div className="w-32">
              <Input
                id="deliveryFee"
                type="number"
                value={clientData.deliveryFee}
                onChange={(e) => handleDeliveryFeeChange(e.target.value)}
                min={0}
                className="text-right"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-medium text-lg">Total:</span>
            <span className="text-xl font-bold">
              R$ {formatCurrency(calculateSubtotal())}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={generateInvoice} className="w-full md:w-auto">
            Gerar Fatura
          </Button>
        </div>
      </div>
    </Card>
  );
};
