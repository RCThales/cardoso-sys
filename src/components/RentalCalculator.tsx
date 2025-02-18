
import { useState, useEffect } from "react";
import {
  calculateTotalPrice,
  PRODUCTS,
  getProductConstants,
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
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

export const RentalCalculator = () => {
  const [days, setDays] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState("muletas-axilares");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCartStore();

  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    setPrice(calculateTotalPrice(days, selectedProduct));
  }, [days, selectedProduct]);

  const getAvailableQuantity = (productId: string) => {
    const item = inventory?.find((i) => i.product_id === productId);
    return item ? item.total_quantity - item.rented_quantity : 0;
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

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    const availableQuantity = getAvailableQuantity(selectedProduct);
    
    if (newQuantity >= 1 && newQuantity <= availableQuantity) {
      setQuantity(newQuantity);
    }
  };

  const constants = getProductConstants(selectedProduct);
  const availableQuantity = getAvailableQuantity(selectedProduct);

  const handleAddToCart = () => {
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
    });

    toast({
      title: "Sucesso",
      description: "Produto adicionado ao carrinho",
    });
  };

  const handleFinishRental = () => {
    navigate("/temp1");
  };

  const specialRates = Object.entries(constants.SPECIAL_RATES).map(
    ([days, price]) => ({
      days: parseInt(days, 10),
      price,
    })
  );

  return (
    <>
      <Card className="w-full max-w-lg mx-auto p-8 shadow-lg animate-fade-in">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="mb-2">
              <>Cardoso Calc</>
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
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTS.map((product) => (
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

            <div className="space-y-2">
              <Button onClick={handleAddToCart} className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" /> Adicionar ao Carrinho
              </Button>
              <Button onClick={handleFinishRental} variant="outline" className="w-full">
                Finalizar Aluguel
              </Button>
            </div>

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
                {constants.CONSTANTE_VALOR_ALUGUEL_A}
              </div>
            </div>
            <div>
              <div className="font-medium">CONSTANTE_VALOR_ALUGUEL_B</div>
              <div className="text-muted-foreground">
                {constants.CONSTANTE_VALOR_ALUGUEL_B}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
