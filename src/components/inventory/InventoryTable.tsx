
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { fetchProducts } from "@/utils/priceCalculator";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";
import { Plus, Minus } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useState } from "react";

export const InventoryTable = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const { data: inventory, isLoading, refetch } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const handleUpdateQuantity = async (itemId: number, change: number) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const item = inventory?.find(i => i.id === itemId);
      if (!item) return;

      const newQuantity = Math.max(0, item.total_quantity + change);
      
      const { error } = await supabase
        .from('inventory')
        .update({ total_quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      await refetch();
      
      toast({
        title: "Sucesso",
        description: "Quantidade atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar quantidade",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !products) {
    return <div className="text-center">Carregando...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead className="text-right">Quantidade Total</TableHead>
          <TableHead className="text-right">Quantidade Alugada</TableHead>
          <TableHead className="text-right">Quantidade Disponível</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventory?.map((item) => {
          const product = products.find((p) => p.id === item.product_id);
          const availableQuantity = item.total_quantity - item.rented_quantity;
          
          return (
            <TableRow key={item.id}>
              <TableCell>{product?.name || item.product_id}</TableCell>
              <TableCell className="text-right">{item.total_quantity}</TableCell>
              <TableCell className="text-right">{item.rented_quantity}</TableCell>
              <TableCell className="text-right">{availableQuantity}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                    disabled={isUpdating || item.total_quantity <= item.rented_quantity}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    disabled={isUpdating}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
