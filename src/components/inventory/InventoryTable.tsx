
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

export const InventoryTable = () => {
  const { data: inventory, isLoading } = useQuery({
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
