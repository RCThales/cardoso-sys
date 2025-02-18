
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/utils/priceCalculator";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent, quantities: Record<string, number>) => Promise<void>;
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
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setQuantities(prev => ({ ...prev, [newSize]: 0 }));
      setNewSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes(sizes.filter(size => size !== sizeToRemove));
    const newQuantities = { ...quantities };
    delete newQuantities[sizeToRemove];
    setQuantities(newQuantities);
  };

  const handleQuantityChange = (size: string, value: string) => {
    const quantity = Math.max(0, parseInt(value) || 0);
    setQuantities(prev => ({ ...prev, [size]: quantity }));
  };

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
        <div className="space-y-2 mt-4">
          {sizes.map((size) => (
            <div key={size} className="flex items-center gap-2">
              <Badge variant="secondary" className="px-2 py-1 min-w-[60px]">
                {size}
                <button
                  type="button"
                  onClick={() => handleRemoveSize(size)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
              <Input
                type="number"
                min="0"
                value={quantities[size] || 0}
                onChange={(e) => handleQuantityChange(size, e.target.value)}
                placeholder="Quantidade"
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">unidades</span>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">
        {selectedProduct ? "Atualizar Produto" : "Adicionar Produto"}
      </Button>
    </form>
  );
};
