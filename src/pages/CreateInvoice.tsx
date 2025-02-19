import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { useCartStore } from "@/store/cartStore";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CreateInvoice = () => {
  const { items } = useCartStore();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Gerar Fatura</h1>
          <p className="text-muted-foreground mt-2">
            Preencha os dados para gerar a fatura
          </p>
        </div>
        <InvoiceGenerator onInvoiceCreated={handleInvoiceCreated} />
      </div>
    </div>
  );
};

export default CreateInvoice;
