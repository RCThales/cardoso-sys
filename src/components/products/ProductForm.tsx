
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/utils/priceCalculator";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  name: string;
  setName: (name: string) => void;
  basePrice: string;
  setBasePrice: (price: string) => void;
  selectedProduct: Product | null;
  sizes: string[];
  setSizes: (sizes: string[]) => void;
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
}: ProductFormProps) => {
  const [newSize, setNewSize] = useState("");

  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes(sizes.filter(size => size !== sizeToRemove));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <div className="space-y-2">
        <label className="text-sm font-medium">Tamanhos Disponíveis</label>
        <div className="flex gap-2">
          <Input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value.toUpperCase())}
            placeholder="Ex: P, M, G"
            className="flex-1"
          />
          <Button type="button" onClick={handleAddSize}>
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {sizes.map((size) => (
            <Badge key={size} variant="secondary" className="px-2 py-1">
              {size}
              <button
                type="button"
                onClick={() => handleRemoveSize(size)}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">
        {selectedProduct ? "Atualizar Produto" : "Adicionar Produto"}
      </Button>
    </form>
  );
};
