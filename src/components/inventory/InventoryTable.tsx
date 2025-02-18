
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
import { Plus, Minus, Search } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do produto"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select
          value={sortOrder}
          onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Ordenar por quantidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Quantidade (menor primeiro)</SelectItem>
            <SelectItem value="desc">Quantidade (maior primeiro)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={showRented}
            onCheckedChange={setShowRented}
          />
          <span className="text-sm">Mostrar apenas com itens alugados</span>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={showAvailable}
            onCheckedChange={setShowAvailable}
          />
          <span className="text-sm">Mostrar apenas com itens disponíveis</span>
        </div>
      </div>

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
            const availableQuantity = item.total_quantity - item.rented_quantity;
            
            return (
              <TableRow key={item.id}>
                <TableCell>{product?.product_code}</TableCell>
                <TableCell>{product?.name}</TableCell>
                <TableCell className="text-right">{item.total_quantity}</TableCell>
                <TableCell className="text-right">{item.rented_quantity}</TableCell>
                <TableCell className="text-right">{availableQuantity}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min="1"
                    value={adjustQuantity[item.id] || 1}
                    onChange={(e) => handleAdjustQuantityChange(item.id, e.target.value)}
                    className="w-20 text-right"
                  />
                </TableCell>
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
    </div>
  );
};
