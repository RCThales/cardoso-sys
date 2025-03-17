import { Navbar } from "@/components/Navbar";
import { InventoryTable } from "@/components/inventory/InventoryTable";

const Inventory = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o estoque de produtos para aluguel
          </p>
        </div>
        <InventoryTable />
      </div>
    </div>
  );
};

export default Inventory;
