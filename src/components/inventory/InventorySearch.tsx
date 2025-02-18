
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface InventorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
}

export const InventorySearch = ({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortOrderChange,
}: InventorySearchProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do produto"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <Select
        value={sortOrder}
        onValueChange={onSortOrderChange}
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
  );
};
