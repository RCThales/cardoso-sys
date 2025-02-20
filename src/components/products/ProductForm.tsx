
import type { Product } from "@/utils/priceCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductForm } from "./useProductForm";
import { SizesSection } from "./SizesSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductFormProps {
  onSubmit: (
    e: React.FormEvent,
    quantities: Record<string, number>
  ) => Promise<void>;
  name: string;
  setName: (name: string) => void;
  basePrice: string;
  setBasePrice: (price: string) => void;
  selectedProduct: Product | null;
  sizes: string[];
  setSizes: (sizes: string[]) => void;
  setInitialQuantity: (quantity: string) => void;
  initialQuantity?: string;
  initialQuantities?: Record<string, number>;
}

export const ProductForm = ({
  onSubmit,
  name,
  setName,
  basePrice,
  setBasePrice,
  selectedProduct,
  sizes,
  setSizes,
  initialQuantities = {},
}: ProductFormProps) => {
  const {
    newSize,
    setNewSize,
    quantities,
    handleAddSize,
    handleRemoveSize,
    handleQuantityChange,
    handleDragEnd,
  } = useProductForm({
    selectedProduct,
    sizes,
    setSizes,
    initialQuantities,
  });

  // Buscar quantidade em estoque atual
  const { data: inventoryData } = useQuery({
    queryKey: ["inventory", selectedProduct?.id],
    queryFn: async () => {
      if (!selectedProduct) return null;
      
      const { data, error } = await supabase
        .from("inventory")
        .select("size, total_quantity")
        .eq("product_id", selectedProduct.id);
        
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProduct,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, quantities);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Produto</label>
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Valor Base</label>
        <Input
          required
          type="number"
          step="0.01"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
        />
      </div>
      
      {selectedProduct && inventoryData && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantidade em Estoque Atual</label>
          <div className="grid gap-2">
            {inventoryData.map((item) => (
              <div key={item.size || 'default'} className="flex justify-between items-center p-2 bg-muted rounded">
                <span>{item.size || 'Padrão'}</span>
                <span className="font-medium">{item.total_quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <SizesSection
        sizes={sizes}
        newSize={newSize}
        setNewSize={setNewSize}
        quantities={quantities}
        onAddSize={handleAddSize}
        onRemoveSize={handleRemoveSize}
        onQuantityChange={handleQuantityChange}
        onDragEnd={handleDragEnd}
      />
      <Button type="submit" className="w-full">
        {selectedProduct ? "Atualizar Produto" : "Adicionar Produto"}
      </Button>
    </form>
  );
};
