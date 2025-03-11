import { useState, useEffect } from "react";
import {
  calculateTotalPrice,
  getProductBasePrice,
  fetchProducts,
  type Product,
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

import { useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut } from "lucide-react";
import { Input } from "./ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "./ui/use-toast";

export const RentalCalculator = () => {
  // Estados
  const [days, setDays] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [basePrice, setBasePrice] = useState<number | null>(null);

  // Hooks de terceiros
  const { toast } = useToast();
  const { addItem, items } = useCartStore();
  const navigate = useNavigate();

  // Queries
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

  // Efeitos
  useEffect(() => {
    if (products && products.length > 0 && !selectedProduct) {
      const firstProduct = products[0];
      setSelectedProduct(firstProduct.id);
      if (firstProduct.sizes && firstProduct.sizes.length > 0) {
        setSelectedSize(firstProduct.sizes[0].size);
      }
    }
  }, [products]);

  useEffect(() => {
    const base_price = getProductBasePrice(products || [], selectedProduct);

    if (base_price) {
      setBasePrice(base_price); // Armazena o base_price no estado

      setPrice(calculateTotalPrice(days, base_price));
    }
  }, [days, selectedProduct, products]);

  // Funções
  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const product = products?.find((p) => p.id === productId);
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].size);
    } else {
      setSelectedSize("");
    }
  };

  const getAvailableQuantity = (productId: string, size?: string) => {
    const item = inventory?.find((i) => {
      if (size) {
        return i.product_id === productId && i.size === size;
      } else {
        return i.product_id === productId && i.size === null;
      }
    });
    return item ? item.total_quantity - item.rented_quantity : 0;
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === "") {
      setQuantity(0); // Considera 0 quando vazio
      return;
    }

    const newQuantity = parseInt(newValue, 10);
    const availableQuantity = getAvailableQuantity(
      selectedProduct,
      selectedSize
    );

    if (
      !isNaN(newQuantity) &&
      newQuantity >= 0 &&
      newQuantity <= availableQuantity
    ) {
      setQuantity(newQuantity);
    }
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

  const handleAddToCart = () => {
    if (!products) return;

    const availableQuantity = inventory
      ? getAvailableQuantity(selectedProduct, selectedSize)
      : 0;

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
      is_sale: false,
      total: price * quantity,
      size: selectedSize || undefined,
      base_price: selectedProductData?.base_price,
    });

    toast({
      title: "Sucesso",
      description: "Produto adicionado ao carrinho",
    });
  };

  // Dados derivados
  const selectedProductData = products?.find((p) => p.id === selectedProduct);
  const availableQuantity = getAvailableQuantity(selectedProduct, selectedSize);
  const isProductInCart = items.some(
    (item) => item.productId === selectedProduct && item.size === selectedSize
  );

  if (!products) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="h-full">
      <Card className="w-screen min-h-screen md:min-h-full h-auto md:mt-8 md:max-w-lg mx-auto p-8 shadow-lg animate-fade-in relative overflow-x-hidden">
        <div className="absolute w-full left-0 top-0 flex">
          <Button
            disabled
            className="bg-gray-200 text-black border-gray-200 hover:bg-gray-50  border-l-[1px] rounded-t-none w-full "
          >
            Aluguel
          </Button>
          <Button
            onClick={() => navigate("/sales")}
            className="bg-white text-black border-gray-200 shadow-md hover:bg-gray-100  border-r-[1px] rounded-t-none w-full "
          >
            Venda
          </Button>
        </div>

        <div className="space-y-8 pt-10">
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="mb-2">
              ALUGUEL
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
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
                        {product.name}{" "}
                        {product.sizes && product.sizes.length > 0
                          ? "(verificar tamanhos)"
                          : `(${getAvailableQuantity(product.id)} disponíveis)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProductData?.sizes &&
                selectedProductData.sizes.length > 0 && (
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
                        {selectedProductData.sizes.map((size) => {
                          const quantityForSize = getAvailableQuantity(
                            selectedProduct,
                            size.size
                          );
                          return (
                            <SelectItem key={size.size} value={size.size}>
                              {size.size} ({quantityForSize} disponíveis)
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Quantidade</span>
                <Input
                  type="number"
                  value={quantity === 0 ? "" : quantity} // Permite campo vazio temporariamente
                  onChange={handleQuantityChange}
                  onBlur={() => {
                    if (quantity === 0) {
                      setQuantity(1); // Se estiver vazio ao perder o foco, volta para 1
                    }
                  }}
                  min={0} // Permite 0 temporariamente
                  max={availableQuantity}
                  className="w-20 text-center"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Duração do Aluguel</span>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={days === 0 ? "" : days} // Permite campo vazio temporariamente
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (newValue === "") {
                        setDays(0); // Temporariamente vazio
                        return;
                      }
                      const newDays = parseInt(newValue, 10);
                      if (newDays >= 1 && newDays <= 180) {
                        setDays(newDays);
                      }
                    }}
                    onBlur={() => {
                      if (days === 0) {
                        setDays(1); // Se estiver vazio ao perder o foco, volta para 1
                      }
                      setPrice(
                        calculateTotalPrice(days || 1, basePrice || 0) *
                          quantity
                      );
                    }}
                    min={0} // Permite 0 temporariamente
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
            <details>
              <summary>Hotkeys</summary>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[5, 7, 10, 15, 20, 30].map((days) => {
                  // Calcula o preço total para os dias específicos
                  const totalPrice = calculateTotalPrice(days, basePrice);

                  return (
                    <Card
                      key={days}
                      className="p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => setDays(days)} // Define os dias ao clicar no card
                    >
                      <div className="font-medium">{days} dias</div>
                      <div className="text-sm text-muted-foreground">
                        R${totalPrice.toFixed(2)}{" "}
                        {/* Exibe o preço total formatado */}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </details>

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
                  {quantity === 0 || days === 0 ? (
                    <div className="animate-pulse bg-gray-300 h-10 w-32 mx-auto rounded-md" />
                  ) : (
                    `R$${(price * quantity).toFixed(2)}`
                  )}
                </div>
              </div>
            </motion.div>

            <Button onClick={handleAddToCart} className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />{" "}
              {isProductInCart ? "Atualizar Carrinho" : "Adicionar ao Carrinho"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
