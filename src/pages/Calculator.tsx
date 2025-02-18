
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
  type ProductSize,
} from "@/utils/priceCalculator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/use-toast";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Slider } from "@/components/ui/slider";

const Calculator = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [days, setDays] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const { toast } = useToast();
  const { addItem } = useCartStore();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data.map(item => ({
        ...item,
        sizes: item.sizes ? (item.sizes as unknown as ProductSize[]) : undefined,
        constants: item.constants as ProductConstants
      })) as Product[];
    },
  });

  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleCalculate = () => {
    const product = products?.find((p) => p.id === selectedProductId);
    if (!product) return;

    const price = calculateTotalPrice(days, product.constants);
    setTotalPrice(price);
  };

  const getAvailableQuantity = (productId: string) => {
    const item = inventory?.find(i => i.product_id === productId && i.size === null);
    return item ? item.total_quantity - item.rented_quantity : 0;
  };

  const handleAddToCart = () => {
    if (!selectedProductId || !products) return;

    const availableQuantity = getAvailableQuantity(selectedProductId);
    if (quantity > availableQuantity) {
      toast({
        title: "Erro",
        description: "Quantidade indisponível em estoque",
        variant: "destructive",
      });
      return;
    }

    if (totalPrice === null) {
      handleCalculate();
    }

    addItem({
      productId: selectedProductId,
      quantity,
      days,
      total: (totalPrice || 0) * quantity,
    });

    toast({
      title: "Sucesso",
      description: "Produto adicionado ao carrinho",
    });
  };

  const selectedProduct = products?.find(p => p.id === selectedProductId);
  const constants = selectedProduct?.constants;
  const specialRates = constants ? Object.entries(constants.SPECIAL_RATES || {}).map(
    ([days, price]) => ({
      days: parseInt(days, 10),
      price: price as number,
    })
  ) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="fixed top-2 right-4 z-50">
        <CartDrawer />
      </div>
      <div className="container py-8">
        <Card className="w-full max-w-lg mx-auto p-8 shadow-lg">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="mb-2">
                Cardoso Calc
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight">
                Calcule o valor do aluguel
              </h1>
            </div>

            <div className="space-y-6">
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
                          {product.name} ({getAvailableQuantity(product.id)} disponíveis)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Quantidade</span>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                    min={1}
                    max={selectedProductId ? getAvailableQuantity(selectedProductId) : 1}
                    className="w-20 text-center"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Duração do Aluguel</span>
                    <span className="text-sm text-muted-foreground">{days} dias</span>
                  </div>
                  <Slider
                    value={[days]}
                    onValueChange={(value) => {
                      setDays(value[0]);
                      handleCalculate();
                    }}
                    min={1}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {totalPrice !== null && (
                <div className="p-6 rounded-lg bg-secondary/50">
                  <div className="text-center space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Preço Total
                    </span>
                    <div className="text-5xl font-semibold tracking-tight">
                      R${(totalPrice * quantity).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {totalPrice / days <= 2 && "Melhor valor!"}
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleAddToCart} className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" /> Adicionar ao Carrinho
              </Button>

              <div className="grid grid-cols-2 gap-4">
                {specialRates.map(({ days: specialDays, price: specialPrice }) => (
                  <Card
                    key={specialDays}
                    className="p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => {
                      setDays(specialDays);
                      handleCalculate();
                    }}
                  >
                    <div className="font-medium">{specialDays} dias</div>
                    <div className="text-sm text-muted-foreground">
                      R${specialPrice}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;
