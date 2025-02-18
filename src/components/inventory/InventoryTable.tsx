
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { fetchProducts } from "@/utils/priceCalculator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { InventorySearch } from "./InventorySearch";
import { InventoryFilters } from "./InventoryFilters";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { InventoryAdjustModal } from "./InventoryAdjustModal";

export const InventoryTable = () => {
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

  if (isLoading || !products) {
    return <div className="text-center">Carregando...</div>;
  }

  const groupedInventory = inventory?.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = [];
    }
    acc[item.product_id].push(item);
    return acc;
  }, {} as Record<string, typeof inventory>);

  const filteredAndGroupedInventory = Object.entries(groupedInventory || {})
    .filter(([productId]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return false;
      
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      const items = groupedInventory[productId];
      const hasRented = items.some(item => item.rented_quantity > 0);
      const hasAvailable = items.some(item => (item.total_quantity - item.rented_quantity) > 0);
      
      if (showRented && !hasRented) return false;
      if (showAvailable && !hasAvailable) return false;
      
      return true;
    })
    .sort(([productIdA], [productIdB]) => {
      const totalA = groupedInventory[productIdA].reduce((sum, item) => sum + item.total_quantity, 0);
      const totalB = groupedInventory[productIdB].reduce((sum, item) => sum + item.total_quantity, 0);
      return sortOrder === "asc" ? totalA - totalB : totalB - totalA;
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
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndGroupedInventory.map(([productId, items]) => {
            const product = products.find((p) => p.id === productId);
            if (!product) return null;

            const hasSizes = items.some(item => item.size);
            
            if (!hasSizes) {
              const item = items[0];
              return (
                <TableRow key={productId}>
                  <TableCell className="font-medium">{product.product_code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                  </TableCell>
                  <TableCell className="text-right">{item.total_quantity}</TableCell>
                  <TableCell className="text-right">{item.rented_quantity}</TableCell>
                  <TableCell className="text-right">{item.total_quantity - item.rented_quantity}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItem({ item, product })}
                      className="w-[140px]"
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Ajustar Total
                    </Button>
                  </TableCell>
                </TableRow>
              );
            }

            return (
              <TableRow key={productId} className="[&_td]:border-b-0">
                <TableCell className="font-medium">{product.product_code}</TableCell>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  <div className="mt-2 space-y-1">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                        <span>Tamanho {item.size}</span>
                        <span className="ml-4">{item.total_quantity - item.rented_quantity} disponíveis</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {items.reduce((sum, item) => sum + item.total_quantity, 0)}
                </TableCell>
                <TableCell className="text-right">
                  {items.reduce((sum, item) => sum + item.rented_quantity, 0)}
                </TableCell>
                <TableCell className="text-right">
                  {items.reduce((sum, item) => sum + (item.total_quantity - item.rented_quantity), 0)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="space-y-2">
                    {items.map(item => (
                      <Button
                        key={item.id}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItem({ item, product })}
                        className="w-[140px]"
                      >
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        {item.size}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedItem && (
        <InventoryAdjustModal
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
          item={selectedItem.item}
          product={selectedItem.product}
          onUpdateQuantity={handleUpdateQuantity}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};
