
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientsFiltersProps {
  orderBy: "totalSpent" | "orderCount";
  onOrderByChange: (value: "totalSpent" | "orderCount") => void;
}

export const ClientsFilters = ({ orderBy, onOrderByChange }: ClientsFiltersProps) => {
  return (
    <Select value={orderBy} onValueChange={onOrderByChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="totalSpent">Valor total gasto</SelectItem>
        <SelectItem value="orderCount">Quantidade de pedidos</SelectItem>
      </SelectContent>
    </Select>
  );
};
