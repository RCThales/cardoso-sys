import { useState, useEffect } from "react";
import {
  calculateTotalPrice,
  getProductConstants,
  fetchProducts,
  type Product,
  type ProductConstants,
} from "../utils/priceCalculator";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Info, ShoppingCart } from "lucide-react";
import { Input } from "./ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "./ui/use-toast";
import { CartDrawer } from "./cart/CartDrawer";

export const RentalCalculator = () => {
  const [days, setDays] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const { toast } = useToast();
  const { addItem } = useCartStore();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (products && products.length > 0) {
      if (!selectedProduct) {
        setSelectedProduct(products[0].id);
        if (products[0].sizes && products[0].sizes.length > 0) {
          setSelectedSize(products[0].sizes[0].size);
        }
      }
      const constants = getProductConstants(products, selectedProduct);
      if (constants) {
        setPrice(calculateTotalPrice(days, constants));
      }
    }
  }, [days, selectedProduct, products]);

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const product = products?.find(p => p.id === productId);
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].size);
    } else {
      setSelectedSize("");
    }
  };

  const getAvailableQuantity = (productId: string, size?: string) => {
    const item = inventory?.find((i) => i.product_id === productId && i.size === size);
    return item ? item.total_quantity - item.rented_quantity : 0;
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    const availableQuantity = getAvailableQuantity(selectedProduct, selectedSize);

    if (newQuantity >= 1 && newQuantity <= availableQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleDaysChange = (value: number[]) => {
    setDays(value[0]);
  };

  const handleDaysInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDays = parseInt(e.target.value, 10);
    if (newDays >= 1 && newDays <= 60) {
      setDays(newDays);
    }
  };

  const selectedProductData = products?.find(p => p.id === selectedProduct);
  const constants = selectedProductData?.constants;
  const availableQuantity = getAvailableQuantity(selectedProduct, selectedSize);

  const handleAddToCart = () => {
    if (!products) return;
    
    const availableQuantity = getAvailableQuantity(selectedProduct, selectedSize);
    
    if (quantity > availableQuantity) {
      toast({
        title: "Erro",
        description: "Quantidade indisponível em estoque",
        variant: "destructive",
      });
      return;
    }

    addItem({
      productId: selectedProduct,
      quantity,
      days,
      total: price * quantity,
      size: selectedSize || undefined
    });

    toast({
      title: "Sucesso",
      description: "Produto adicionado ao carrinho",
    });
  };

  if (!products) {
    return <div>Carregando...</div>;
  }

  const specialRates = constants ? Object.entries(constants.SPECIAL_RATES).map(
    ([days, price]) => ({
      days: parseInt(days, 10),
      price,
    })
  ) : [];

  return (
    <div className="relative">
      <div className="fixed top-2 right-4 z-50">
        <CartDrawer />
      </div>
      <Card className="w-full max-w-lg mx-auto p-8 shadow-lg animate-fade-in">
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
                <span className="text-sm font-medium">Produto</span>
                <Select
                  value={selectedProduct}
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProductData?.sizes && selectedProductData.sizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Tamanho</span>
                  <Select
                    value={selectedSize}
                    onValueChange={setSelectedSize}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProductData.sizes.map((size) => (
                        <SelectItem key={size.size} value={size.size}>
                          {size.size} ({getAvailableQuantity(selectedProduct, size.size)} disponíveis)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Quantidade</span>
                <Input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min={1}
                  max={availableQuantity}
                  className="w-20 text-center"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Duração do Aluguel</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={days}
                    onChange={handleDaysInputChange}
                    min={1}
                    max={180}
                    className="w-16 text-center border p-2 rounded-md"
                  />
                  <span className="text-sm text-muted-foreground">
                    {days} dias
                  </span>
                </div>
              </div>
              <Slider
                value={[days]}
                onValueChange={handleDaysChange}
                min={1}
                max={180}
                step={1}
                className="w-full"
              />
            </div>

            <motion.div
              key={price}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg bg-secondary/50"
            >
              <div className="text-center space-y-2">
                <span className="text-sm text-muted-foreground">
                  Preço Total
                </span>
                <div className="text-5xl font-semibold tracking-tight">
                  R${(price * quantity).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {price / days <= 2 && "Melhor valor!"}
                </div>
              </div>
            </motion.div>

            <Button onClick={handleAddToCart} className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" /> Adicionar ao Carrinho
            </Button>

            <div className="grid grid-cols-2 gap-4 mt-6">
              {specialRates.map(
                ({ days: specialDays, price: specialPrice }) => (
                  <Card
                    key={specialDays}
                    className="p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => setDays(specialDays)}
                  >
                    <div className="font-medium">{specialDays} dias</div>
                    <div className="text-sm text-muted-foreground">
                      R${specialPrice}
                    </div>
                  </Card>
                )
              )}
            </div>
          </div>
        </div>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-4 right-4 rounded-full"
            variant="outline"
          >
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Constantes do Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="font-medium">CONSTANTE_VALOR_ALUGUEL_A</div>
              <div className="text-muted-foreground">
                {constants?.CONSTANTE_VALOR_ALUGUEL_A}
              </div>
            </div>
            <div>
              <div className="font-medium">CONSTANTE_VALOR_ALUGUEL_B</div>
              <div className="text-muted-foreground">
                {constants?.CONSTANTE_VALOR_ALUGUEL_B}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
