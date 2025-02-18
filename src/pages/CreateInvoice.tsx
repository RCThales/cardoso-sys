
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { useCartStore } from "@/store/cartStore";
import { useNavigate } from "react-router-dom";

const CreateInvoice = () => {
  const { items } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length === 0) {
      navigate("/calc");
    }
  }, [items, navigate]);

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
        <InvoiceGenerator />
      </div>
    </div>
  );
};

export default CreateInvoice;
