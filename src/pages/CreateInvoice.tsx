
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { useCartStore } from "@/store/cartStore";
import { useNavigate } from "react-router-dom";
import { CartDrawer } from "@/components/cart/CartDrawer";

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
        <div className="relative">
          <div className="fixed top-4 right-4 z-50">
            <CartDrawer />
          </div>
          <InvoiceGenerator />
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
