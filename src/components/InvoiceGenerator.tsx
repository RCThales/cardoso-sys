
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CompanyHeader } from "./invoice/CompanyHeader";
import { ClientForm } from "./invoice/ClientForm";
import { InvoiceItems } from "./invoice/InvoiceItems";
import { useInvoiceGeneration } from "@/hooks/useInvoiceGeneration";

export const InvoiceGenerator = () => {
  const {
    items,
    clientData,
    setClientData,
    addItem,
    updateItem,
    calculateSubtotal,
    generateInvoice,
  } = useInvoiceGeneration();

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
        />

        <div className="flex justify-end space-x-4 items-center">
          <span className="font-medium">Total:</span>
          <span className="text-xl">
            R$ {calculateSubtotal().toFixed(2)}
          </span>
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
