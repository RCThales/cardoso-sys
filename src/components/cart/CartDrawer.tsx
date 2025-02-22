import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { Minus, Plus, ShoppingCart, Trash2, Tag, Calendar } from "lucide-react";
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
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      return data;
    },
  });

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

  const handleQuantityChange = (
    item: (typeof items)[0],
    newQuantity: number
  ) => {
    const availableQuantity = getAvailableQuantity(item.productId, item.size);

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
        total: item.is_sale
          ? (item.sale_price || 0) * newQuantity // Recalcula o total para itens em promoção
          : (item.total / item.quantity) * newQuantity, // Recalcula o total para itens fora de promoção
      });
    }
  };

  const handleDaysChange = (item: (typeof items)[0], newDays: number) => {
    if (newDays < 1) {
      toast({
        title: "Erro",
        description: "O número de dias deve ser maior ou igual a 1",
        variant: "destructive",
      });
      return;
    }

    const product = products?.find((p) => p.id === item.productId);
    if (!product) return;

    // Recalcula o total com base no novo número de dias
    const newTotal = item.is_sale
      ? (item.sale_price || 0) * item.quantity // Mantém o total para itens em promoção
      : product.base_price * newDays * item.quantity; // Recalcula o total para itens fora de promoção

    addItem({
      ...item,
      days: newDays,
      total: newTotal,
    });
  };

  const hasSaleItems = items.some((item) => item.is_sale);
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const totalPrice = subtotal;

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
          <SheetTitle>Carrinho</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {items.map((item) => {
            const product = products?.find((p) => p.id === item.productId);
            return (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex flex-col space-y-2 p-4 border rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {item.is_sale && (
                      <Tag className="inline-block w-4 h-4 mr-2 text-blue-500" />
                    )}
                    {!item.is_sale && (
                      <Calendar className="inline-block w-4 h-4 mr-2 text-green-500" />
                    )}
                    {product?.name}
                    {item.size && (
                      <span className="text-muted-foreground ml-2">
                        ({item.size})
                      </span>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.productId, item.size)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Quantidade:
                  </span>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item, parseInt(e.target.value, 10))
                    }
                    className="w-20 text-right"
                  />
                </div>
                {!item.is_sale && (
                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-sm text-muted-foreground">Dias:</span>
                    <Input
                      type="number"
                      value={item.days}
                      onChange={(e) =>
                        handleDaysChange(item, parseInt(e.target.value, 10))
                      }
                      className="w-20 text-right"
                      min={1}
                    />
                  </div>
                )}
                <div className="text-right font-medium">
                  R${item.total.toFixed(2)}
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
                Finalizar Pedido
              </Button>
              <div>
                <Tag className="inline-block w-3 h-3 mr-2 text-blue-500" />{" "}
                <span className="text-gray-500 text-sm">Venda</span>
              </div>
              <div>
                <Calendar className="inline-block w-3 h-3 mr-2 text-green-500" />{" "}
                <span className="text-gray-500 text-sm">Aluguel</span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
