import type { Product } from "@/utils/priceCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductForm } from "./useProductForm";
import { SizesSection } from "./SizesSection";

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
  setInitialQuantity,
  initialQuantity,
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
      {sizes.length === 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantidade em Estoque</label>
          <Input
            type="number"
            required
            value={initialQuantity}
            onChange={(e) => setInitialQuantity(e.target.value)}
          />
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
