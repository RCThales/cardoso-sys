
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ProductSearch } from "./ProductSearch";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  items: Array<{ id: string; name: string; label?: string }>;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchableSelect = ({
  items,
  value,
  onValueChange,
  placeholder = "Select an item",
  className,
}: SearchableSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="min-w-[240px]">
        <div className="p-2">
          <ProductSearch searchTerm={searchTerm} onSearch={handleSearch} />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name} {item.label && ` (${item.label})`}
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
};
