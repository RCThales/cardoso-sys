
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/utils/priceCalculator";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleAddSize = async () => {
    if (newSize && !sizes.includes(newSize)) {
      try {
        // Se estivermos editando um produto existente, atualize os tamanhos no banco
        if (selectedProduct) {
          const updatedSizes = [...sizes, newSize].map(size => ({ size }));
          const { error } = await supabase
            .from("products")
            .update({
              sizes: updatedSizes,
            })
            .eq("id", selectedProduct.id);

          if (error) throw error;

          // Use upsert em vez de insert para o inventário
          const { error: inventoryError } = await supabase
            .from("inventory")
            .upsert({
              product_id: selectedProduct.id,
              size: newSize,
              total_quantity: 0,
              rented_quantity: 0,
            }, {
              onConflict: 'product_id,size'
            });

          if (inventoryError) throw inventoryError;
        }

        setSizes([...sizes, newSize]);
        setQuantities(prev => ({ ...prev, [newSize]: 0 }));
        setNewSize("");
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao adicionar tamanho",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveSize = async (sizeToRemove: string) => {
    try {
      if (selectedProduct) {
        const updatedSizes = sizes
          .filter(size => size !== sizeToRemove)
          .map(size => ({ size }));

        const { error } = await supabase
          .from("products")
          .update({
            sizes: updatedSizes,
          })
          .eq("id", selectedProduct.id);

        if (error) throw error;

        // Remove a entrada do inventário
        const { error: inventoryError } = await supabase
          .from("inventory")
          .delete()
          .eq("product_id", selectedProduct.id)
          .eq("size", sizeToRemove);

        if (inventoryError) throw inventoryError;
      }

      setSizes(sizes.filter(size => size !== sizeToRemove));
      const newQuantities = { ...quantities };
      delete newQuantities[sizeToRemove];
      setQuantities(newQuantities);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover tamanho",
        variant: "destructive",
      });
    }
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
