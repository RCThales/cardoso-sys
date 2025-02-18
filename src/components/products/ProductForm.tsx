import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/utils/priceCalculator";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductFormProps {
  onSubmit: (e: React.FormEvent, quantities: Record<string, number>) => Promise<void>;
  name: string;
  setName: (name: string) => void;
  basePrice: string;
  setBasePrice: (price: string) => void;
  selectedProduct: Product | null;
  sizes: string[];
  setSizes: (sizes: string[]) => void;
  initialQuantities?: Record<string, number>;
}

interface SortableSizeItemProps {
  size: string;
  quantity: number;
  onQuantityChange: (value: string) => void;
  onRemove: () => void;
}

const SortableSizeItem = ({ size, quantity, onQuantityChange, onRemove }: SortableSizeItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: size });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div style={style} className="flex items-center gap-2 mb-2">
      <div 
        ref={setNodeRef}
        {...attributes}
        {...listeners}
      >
        <Badge 
          variant="secondary" 
          className="px-2 py-1 min-w-[60px] cursor-grab"
        >
          {size}
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      </div>
      <Input
        type="number"
        min="0"
        value={quantity}
        onChange={(e) => onQuantityChange(e.target.value)}
        placeholder="Quantidade"
        className="w-32"
      />
      <span className="text-sm text-muted-foreground">unidades</span>
    </div>
  );
};

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
  const [newSize, setNewSize] = useState("");
  const [quantities, setQuantities] = useState(initialQuantities);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddSize = async () => {
    if (newSize && !sizes.includes(newSize)) {
      try {
        if (selectedProduct) {
          const updatedSizes = [...sizes, newSize].map(size => ({ size }));
          const { error } = await supabase
            .from("products")
            .update({
              sizes: updatedSizes,
            })
            .eq("id", selectedProduct.id);

          if (error) throw error;

          const { error: inventoryError } = await supabase
            .from("inventory")
            .upsert(
              {
                product_id: selectedProduct.id,
                size: newSize,
                total_quantity: 0,
                rented_quantity: 0,
              },
              {
                onConflict: 'product_id,size'
              }
            );

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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) {
      return;
    }
    
    const oldIndex = sizes.indexOf(active.id);
    const newIndex = sizes.indexOf(over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newSizes = arrayMove(sizes, oldIndex, newIndex);
      setSizes(newSizes);

      if (selectedProduct) {
        try {
          const { error } = await supabase
            .from("products")
            .update({
              sizes: newSizes.map(size => ({ size })),
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sizes}
              strategy={verticalListSortingStrategy}
            >
              {sizes.map((size) => (
                <SortableSizeItem
                  key={size}
                  size={size}
                  quantity={quantities[size] || 0}
                  onQuantityChange={(value) => handleQuantityChange(size, value)}
                  onRemove={() => handleRemoveSize(size)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      <Button type="submit" className="w-full">
        {selectedProduct ? "Atualizar Produto" : "Adicionar Produto"}
      </Button>
    </form>
  );
};
