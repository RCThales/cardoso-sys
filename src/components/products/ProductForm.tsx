import type { Product } from "@/utils/priceCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductForm } from "./useProductForm";
import { SizesSection } from "./SizesSection";
import { calculateTotalPrice } from "@/utils/priceCalculator";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  name: string;
  setName: (name: string) => void;
  basePrice: string;
  setBasePrice: (price: string) => void;
  salePrice: string;
  setSalePrice: (price: string) => void;
  selectedProduct: Product | null;
  sizes: string[];
  setSizes: (sizes: string[]) => void;
  setInitialQuantity: (quantity: string) => void;
  quantity?: string;
  setQuantity: (quantity: string) => void;
  quantities?: any;
  setQuantities?: (quantities: any) => void;
  initialQuantities?: Record<string, number>;
}

export const ProductForm = ({
  onSubmit,
  name,
  setName,
  basePrice,
  setBasePrice,
  salePrice,
  setSalePrice,
  quantity,
  setQuantity,
  quantities,
  setQuantities,
  selectedProduct,
  sizes,
  setSizes,
  initialQuantities = {},
}: ProductFormProps) => {
  const {
    newSize,
    setNewSize,
    handleAddSize,
    handleRemoveSize,
    handleDragEnd,
  } = useProductForm({
    selectedProduct,
    sizes,
    setSizes,
    initialQuantities,
  });

  const [days, setDays] = useState(1);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };
  const handleDaysChange = (value: number[]) => {
    setDays(value[0]);
  };
  const handleDaysInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDays = parseInt(e.target.value, 10);
    if (newDays >= 1 && newDays <= 180) {
      setDays(newDays);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 flex flex-col h-full justify-start"
    >
      <div className="space-y-2 relative">
        <label className="text-sm font-medium">Nome do Produto</label>
        <div className="relative h-fit">
          <Input
            placeholder="Ex: Muleta Axilar"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pr-8"
          />
          {name && (
            <button
              onClick={() => setName("")}
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              &#10005;
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Valor Base</label>
        <Input
          required
          type="number"
          step="any"
          placeholder="Ex: 10,50"
          min={0}
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
        />
        <details>
          <summary className="text-sm font-medium">Cálculos de aluguel</summary>
          <br />
          <div className="flex w-full justify-evenly items-center">
            <div className="flex justify-center items-center gap-2">
              <input
                type="number"
                value={days}
                onChange={handleDaysInputChange}
                min={1}
                max={180}
                className="w-16 text-center border p-2 rounded-md "
              />{" "}
              <span className="text-sm font-medium">
                {days === 1 ? " dia" : " dias"}
              </span>
            </div>
            <span className="w-full h-[1px] rounded-full bg-gray-300 mx-10"></span>
            <p className="text-lg font-medium">
              ${calculateTotalPrice(days, parseFloat(basePrice)).toFixed(2)}
            </p>
          </div>
          <br />
          <Slider
            value={[days]}
            onValueChange={handleDaysChange}
            min={1}
            max={180}
            step={1}
            className="w-full"
          />
        </details>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Valor de Venda</label>
        <Input
          required
          type="number"
          step="any"
          placeholder="Ex: 10,50"
          min={0}
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
        />
      </div>

      {sizes.length === 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Quantidade em Estoque Atual
          </label>
          <div className="grid gap-2">
            <div
              key={"default_inventory_item_add"}
              className="flex justify-between items-center p-2 rounded"
            >
              <Input
                required
                placeholder="Ex: 25"
                type="number"
                value={quantity}
                min={0}
                onChange={(e) => {
                  setQuantity(e.target.value);
                }}
              />
            </div>
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
        onQuantityChange={setQuantities}
        onDragEnd={handleDragEnd}
      />
      <span className="h-full"></span>
      <Button type="submit" className="w-full ">
        {selectedProduct ? "Atualizar Produto" : "Adicionar Produto"}
      </Button>
    </form>
  );
};
