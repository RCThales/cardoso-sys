import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import { fetchProducts } from "@/utils/priceCalculator";

export const CartDrawer = () => {
  const { items, addItem, removeItem } = useCartStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

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

  const getAvailableQuantity = (productId: string) => {
    const item = inventory?.find((i) => i.product_id === productId);
    return item ? item.total_quantity - item.rented_quantity : 0;
  };

  const handleQuantityChange = (item: typeof items[0], newQuantity: number) => {
    const availableQuantity = getAvailableQuantity(item.productId);
    
    if (newQuantity > availableQuantity) {
      toast({
        title: "Erro",
        description: "Quantidade indisponível em estoque",
        variant: "destructive",
      });
      return;
    }

    if (newQuantity >= 1) {
      addItem({
        ...item,
        quantity: newQuantity,
        total: (item.total / item.quantity) * newQuantity,
      });
    }
  };

  const totalPrice = items.reduce((acc, item) => acc + item.total, 0);

  if (!products) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Carrinho de Aluguel</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {items.map((item) => {
            const product = products?.find((p) => p.id === item.productId);
            return (
              <div key={`${item.productId}-${item.size}`} className="flex flex-col space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {product?.name}
                    {item.size && <span className="ml-2 text-muted-foreground">({item.size})</span>}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.productId, item.size)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {item.days} dias
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, parseInt(e.target.value, 10))}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right font-medium">
                    R${item.total.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-center text-muted-foreground">
              Carrinho vazio
            </div>
          )}
          {items.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center font-medium">
                <span>Total</span>
                <span>R${totalPrice.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate("/invoices/create")}
              >
                Finalizar Aluguel
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
