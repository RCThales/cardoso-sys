
import { Navbar } from "@/components/Navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  calculateTotalPrice,
  type Product,
  type ProductConstants,
} from "@/utils/priceCalculator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Calculator = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [days, setDays] = useState<string>("1");
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as Product[];
    },
  });

  const handleCalculate = () => {
    const product = products?.find((p) => p.id === selectedProductId);
    if (!product) return;

    const price = calculateTotalPrice(Number(days), product.constants as ProductConstants);
    setTotalPrice(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-4xl font-bold tracking-tight mb-8">Calculadora</h1>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Produto</label>
              <Select 
                value={selectedProductId} 
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dias</label>
              <Input
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleCalculate}
              className="w-full"
              disabled={!selectedProductId || !days}
            >
              Calcular
            </Button>

            {totalPrice !== null && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-lg font-semibold">
                  Valor Total: R$ {totalPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
