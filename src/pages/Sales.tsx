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
import { CartDrawer } from "@/components/cart/CartDrawer";
import { handleLogout } from "@/utils/Logout";
import { fetchProducts, type Product } from "@/utils/priceCalculator";
import { Navbar } from "@/components/Navbar";

const Sales = () => {
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

  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (products && products.length > 0 && !selectedProduct) {
      const firstProduct = products[0];
      setSelectedProduct(firstProduct.id);
      if (firstProduct.sizes && firstProduct.sizes.length > 0) {
        setSelectedSize(firstProduct.sizes[0].size);
      }
    }
  }, [products]);

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
    const newQuantity = parseInt(e.target.value, 10);
    const availableQuantity = getAvailableQuantity(
      selectedProduct,
      selectedSize
    );

    if (
      !isNaN(newQuantity) &&
      newQuantity >= 1 &&
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

  const selectedProductData = products?.find((p) => p.id === selectedProduct);
  const availableQuantity = getAvailableQuantity(selectedProduct, selectedSize);
  const isProductInCart = items.some(
    (item) => item.productId === selectedProduct && item.size === selectedSize
  );

  if (!products) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="relative">
      <Navbar />
      <div className="fixed top-2 right-4 z-50 flex items-center gap-2 ">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleLogout(navigate)}
        >
          <LogOut className="h-5 w-5" />
        </Button>
        <CartDrawer />
      </div>
      <br />
      <Card className=" max-w-[85%] md:max-w-lg mx-auto p-8 shadow-lg animate-fade-in">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="mb-2">
              Vendas
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight">
              Calcule o valor da venda
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
                        {selectedProductData.sizes.map((size) => (
                          <SelectItem key={size.size} value={size.size}>
                            {size.size} ({availableQuantity} disponíveis)
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
                  R$
                  {((selectedProductData?.sale_price || 0) * quantity).toFixed(
                    2
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

export default Sales;
