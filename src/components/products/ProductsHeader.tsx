import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductsHeaderProps {
  onNewProduct: () => void;
}

export const ProductsHeader = ({ onNewProduct }: ProductsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold tracking-tight">Produtos</h1>
      <Button onClick={onNewProduct}>
        <Plus className="w-4 h-4 mr-2" />
        Novo Produto
      </Button>
    </div>
  );
};
