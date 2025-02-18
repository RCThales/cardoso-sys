
import { Navbar } from "@/components/Navbar";
import { InvoiceHistory as InvoiceHistoryComponent } from "@/components/InvoiceHistory";

const InvoiceHistory = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Histórico de Faturas</h1>
          <p className="text-muted-foreground mt-2">
            Visualize todas as faturas geradas
          </p>
        </div>
        <InvoiceHistoryComponent />
      </div>
    </div>
  );
};

export default InvoiceHistory;
