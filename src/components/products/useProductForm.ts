import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { arrayMove } from "@dnd-kit/sortable";
import type { Product } from "@/utils/priceCalculator";

interface UseProductFormProps {
  selectedProduct: Product | null;
  sizes: string[];
  setSizes: (sizes: string[] | ((prevSizes: string[]) => string[])) => void;
  initialQuantities?: Record<string, number>;
}

export const useProductForm = ({
  selectedProduct,
  sizes,
  setSizes,
  initialQuantities = {},
}: UseProductFormProps) => {
  const [newSize, setNewSize] = useState("");
  const [quantities, setQuantities] = useState(initialQuantities);
  const { toast } = useToast();

  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      // Atualizar a UI localmente para adicionar o novo tamanho
      setSizes((prevSizes: string[]) => [...prevSizes, newSize]);
      setQuantities((prev) => ({ ...prev, [newSize]: 0 }));
      setNewSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    // Atualizar a UI localmente para remover o tamanho
    setSizes((prevSizes) => {
      return prevSizes.filter((size) => size !== sizeToRemove);
    });

    const newQuantities = { ...quantities };

    delete newQuantities[sizeToRemove];

    if (Object.keys(newQuantities).length === 0) {
      newQuantities["null"] = 0;
    }

    setQuantities(newQuantities);
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
          console.error("Erro ao atualizar ordem:", error);
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
    quantities,
    handleAddSize,
    handleRemoveSize,
    handleDragEnd,
  };
};
