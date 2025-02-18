
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import { fetchProducts } from "@/utils/priceCalculator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { InventorySearch } from "./InventorySearch";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryTableRow } from "./InventoryTableRow";

export const InventoryTable = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showRented, setShowRented] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState<Record<number, number>>({});
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

      const adjustmentValue = adjustQuantity[itemId] || 1;
      const newQuantity = Math.max(0, item.total_quantity + (change * adjustmentValue));
      
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

  const handleAdjustQuantityChange = (itemId: number, value: string) => {
    const numValue = parseInt(value) || 1;
    setAdjustQuantity(prev => ({
      ...prev,
      [itemId]: Math.max(1, numValue)
    }));
  };

  if (isLoading || !products) {
    return <div className="text-center">Carregando...</div>;
  }

  const filteredInventory = inventory
    ?.filter(item => {
      const product = products.find(p => p.id === item.product_id);
      const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const hasRented = item.rented_quantity > 0;
      const hasAvailable = (item.total_quantity - item.rented_quantity) > 0;
      
      if (showRented && !hasRented) return false;
      if (showAvailable && !hasAvailable) return false;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.total_quantity - b.total_quantity;
      }
      return b.total_quantity - a.total_quantity;
    });

  return (
    <div className="space-y-4">
      <InventorySearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortOrderChange={(value: "asc" | "desc") => setSortOrder(value)}
      />

      <InventoryFilters
        showRented={showRented}
        showAvailable={showAvailable}
        onShowRentedChange={setShowRented}
        onShowAvailableChange={setShowAvailable}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Quantidade Total</TableHead>
            <TableHead className="text-right">Quantidade Alugada</TableHead>
            <TableHead className="text-right">Quantidade Disponível</TableHead>
            <TableHead className="text-right">Ajuste</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInventory?.map((item) => {
            const product = products.find((p) => p.id === item.product_id);
            
            return (
              <InventoryTableRow
                key={item.id}
                item={item}
                product={product}
                adjustQuantity={adjustQuantity[item.id] || 1}
                isUpdating={isUpdating}
                onAdjustQuantityChange={(value) => handleAdjustQuantityChange(item.id, value)}
                onUpdateQuantity={(change) => handleUpdateQuantity(item.id, change)}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
