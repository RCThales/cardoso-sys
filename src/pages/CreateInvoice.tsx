
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { useCartStore } from "@/store/cartStore";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { PaymentMethodDialog } from "@/components/invoice/PaymentMethodDialog";
import { Button } from "@/components/ui/button";

const CreateInvoice = () => {
  const { items } = useCartStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [invoiceRef, setInvoiceRef] = useState<{
    generateInvoice: () => Promise<string | undefined>;
    setPaymentMethod: (method: string) => void;
    setInstallments: (installments?: number) => void;
    setSplitPayments: (payments?: any[]) => void;
  } | null>(null);

  useEffect(() => {
    // Solicita permissão para notificações quando o componente montar
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notificações permitidas");
        }
      });
    }
  }, [items, navigate]);

  const handleInvoiceCreated = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("Fatura Gerada", {
        body: "Uma nova fatura foi gerada com sucesso!",
        icon: "/lovable-uploads/25a6caa4-8d3c-4b1a-a64c-57409797e579.png",
        badge: "/lovable-uploads/25a6caa4-8d3c-4b1a-a64c-57409797e579.png",
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        navigate("/invoices");
      };
    }
  };

  const handlePaymentSelect = async (method: string, installments?: number, splitPayments?: any[]) => {
    if (invoiceRef) {
      invoiceRef.setPaymentMethod(method);
      
      if (installments) {
        invoiceRef.setInstallments(installments);
      }
      
      if (splitPayments) {
        invoiceRef.setSplitPayments(splitPayments);
      }
      
      const invoiceCreated = await invoiceRef.generateInvoice();
      if (invoiceCreated) {
        navigate("/invoices/history?invoice_id=" + invoiceCreated);
        handleInvoiceCreated();
      }
    }
  };

  const handlePaymentClick = (generatedTotal: number, invoiceRefObj: any) => {
    setTotal(generatedTotal);
    setInvoiceRef(invoiceRefObj);
    setIsPaymentDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Gerar Fatura</h1>
          <p className="text-muted-foreground mt-2">
            Preencha os dados para gerar a fatura
          </p>
        </div>
        <InvoiceGenerator 
          onInvoiceCreated={handleInvoiceCreated} 
          onPaymentClick={handlePaymentClick}
        />
        
        <PaymentMethodDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          onConfirm={handlePaymentSelect}
          total={total}
        />
      </div>
    </div>
  );
};

export default CreateInvoice;
