import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { arrayMove } from "@dnd-kit/sortable";
import type { Product } from "@/utils/priceCalculator";

interface UseProductFormProps {
  selectedProduct: Product | null;
  sizes: string[];
  setSizes: (sizes: string[]) => void;
  initialQuantity?: string;
  initialQuantities?: Record<string, number>;
}

export const useProductForm = ({
  selectedProduct,
  sizes,
  setSizes,
  initialQuantity,
  initialQuantities = {},
}: UseProductFormProps) => {
  const [newSize, setNewSize] = useState("");
  const [quantity, setQuantity] = useState(initialQuantity);
  const [quantities, setQuantities] = useState(initialQuantities);
  const { toast } = useToast();

  const handleAddSize = async () => {
    if (newSize && !sizes.includes(newSize)) {
      try {
        if (selectedProduct) {
          const updatedSizes = [...sizes, newSize].map((size) => ({ size }));
          const { error } = await supabase
            .from("products")
            .update({
              sizes: updatedSizes,
            })
            .eq("id", selectedProduct.id);

          if (error) throw error;

          const { error: inventoryError } = await supabase
            .from("inventory")
            .insert({
              product_id: selectedProduct.id,
              size: newSize,
              total_quantity: 0,
              rented_quantity: 0,
            });

          if (inventoryError) throw inventoryError;
        }

        setSizes([...sizes, newSize]);
        setQuantities((prev) => ({ ...prev, [newSize]: 0 }));
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
          .filter((size) => size !== sizeToRemove)
          .map((size) => ({ size }));

        const { error } = await supabase
          .from("products")
          .update({
            sizes: updatedSizes,
          })
          .eq("id", selectedProduct.id);

        if (error) throw error;

        const { error: inventoryError } = await supabase
          .from("inventory")
          .delete()
          .eq("product_id", selectedProduct.id)
          .eq("size", sizeToRemove);

        if (inventoryError) throw inventoryError;
      }

      setSizes(sizes.filter((size) => size !== sizeToRemove));
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
    setQuantities((prev) => ({ ...prev, [size]: quantity }));
  };

  const handleDragEnd = async (event: {
    active: { id: string };
    over: { id: string };
  }) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sizes.indexOf(active.id);
      const newIndex = sizes.indexOf(over.id);

      const newSizes = arrayMove(sizes, oldIndex, newIndex);
      setSizes(newSizes);

      if (selectedProduct) {
        try {
          const { error } = await supabase
            .from("products")
            .update({
              sizes: newSizes.map((size) => ({ size })),
            })
            .eq("id", selectedProduct.id);

          if (error) throw error;
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao atualizar ordem dos tamanhos",
            variant: "destructive",
          });
        }
      }
    }
  };

  return {
    newSize,
    setNewSize,
    setQuantity,
    quantity,
    quantities,
    handleAddSize,
    handleRemoveSize,
    handleQuantityChange,
    handleDragEnd,
  };
};
