
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts } from "@/utils/priceCalculator";
import { useToast } from "../ui/use-toast";

export const useInventory = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showRented, setShowRented] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    item: any;
    product: any;
  } | null>(null);
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

  const handleUpdateQuantity = async (itemId: number, change: number, adjustValue: number) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const item = inventory?.find(i => i.id === itemId);
      if (!item) return;

      const newQuantity = Math.max(0, item.total_quantity + (change * adjustValue));
      
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
      
      setSelectedItem(null);
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

  const sortSizes = (items: any[]) => {
    const sizeOrder = ['P', 'M', 'G'];
    return [...items].sort((a, b) => {
      if (!a.size || !b.size) return 0;
      return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
    });
  };

  return {
    inventory,
    products,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    showRented,
    setShowRented,
    showAvailable,
    setShowAvailable,
    selectedItem,
    setSelectedItem,
    handleUpdateQuantity,
    isUpdating,
    sortSizes
  };
};
