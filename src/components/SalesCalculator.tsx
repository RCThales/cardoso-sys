import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";
import { fetchProducts, type Product } from "@/utils/priceCalculator";
import { SearchableSelect } from "@/components/products/SearchableSelect";
import { Navbar } from "@/components/Navbar";

export const SalesCalculator = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const { toast } = useToast();
  const { addItem, items } = useCartStore();
  const navigate = useNavigate();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Filter products with sale_price > 0
  const filteredProducts = products?.filter(p => p.sale_price > 0) || [];

  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (filteredProducts && filteredProducts.length > 0 && !selectedProduct) {
      const firstProduct = filteredProducts[0];
      setSelectedProduct(firstProduct.id);
      if (firstProduct.sizes && firstProduct.sizes.length > 0) {
        setSelectedSize(firstProduct.sizes[0].size);
      }
    }
  }, [filteredProducts]);

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

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    addItem({
      productId: selectedProduct,
      quantity,
      days: 1,
      total: product.sale_price * quantity,
      size: selectedSize || undefined,
      base_price: product.base_price,
      is_sale: true,
      sale_price: product.sale_price,
    });

    toast({
      title: "Sucesso",
      description: "Produto adicionado ao carrinho",
    });
  };

  const selectedProductData = filteredProducts?.find((p) => p.id === selectedProduct);
  const availableQuantity = getAvailableQuantity(selectedProduct, selectedSize);
  const isProductInCart = items.some(
    (item) => item.productId === selectedProduct && item.size === selectedSize
  );

  if (!filteredProducts || filteredProducts.length === 0) {
    return <div>Não há produtos disponíveis para venda</div>;
  }

  // Format products for the searchable select
  const productItems = filteredProducts?.map((product) => ({
    id: product.id,
    name: product.name,
    label: product.sizes && product.sizes.length > 0
      ? "(verificar tamanhos)"
      : `(${getAvailableQuantity(product.id)} disponíveis)`
  })) || [];

  return (
    <div className="h-full">
      <Card className="w-screen min-h-screen md:min-h-full h-auto md:mt-8 md:max-w-lg mx-auto p-8 shadow-lg animate-fade-in relative overflow-x-hidden">
        <div className="absolute w-full left-0 top-0 flex">
          <Button
            onClick={() => navigate("/rentals")}
            className="bg-white text-black border-gray-200 shadow-md hover:bg-gray-100 border-r-[1px] rounded-t-none w-full dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Aluguel
          </Button>
          <Button
            disabled
            className="bg-gray-200 text-black border-gray-200 hover:bg-gray-50 border-l-[1px] rounded-t-none w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Venda
          </Button>
        </div>
        <div className="space-y-8 pt-10">
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="mb-2">
              VENDAS
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              Calcule o valor da venda
            </h1>
            {/* Botão para a página de Aluguel */}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">Produto</span>
                <SearchableSelect
                  items={productItems}
                  value={selectedProduct}
                  onValueChange={handleProductChange}
                  placeholder="Selecione um produto"
                />
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
            </div>

            <motion.div
              key={selectedProductData?.sale_price}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg bg-secondary/50"
            >
              <div className="text-center space-y-2">
                <span className="text-sm text-muted-foreground">
                  Preço Total
                </span>
                <div className="text-5xl font-semibold tracking-tight">
                  {quantity === 0 ? (
                    <div className="animate-pulse bg-gray-300 h-10 w-32 mx-auto rounded-md dark:bg-gray-600" />
                  ) : (
                    `R$${(
                      (selectedProductData?.sale_price || 0) * quantity
                    ).toFixed(2)}`
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
