
import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  // When closing without selecting anything, select the first item if available
  useEffect(() => {
    if (!isOpen && searchTerm && !value && filteredItems.length > 0) {
      // Select the first filtered item when closing dropdown without a selection
      onValueChange(filteredItems[0].id);
    }
    
    // Clear search input when closing the dropdown
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen, filteredItems, value, searchTerm, onValueChange]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Make sure input stays focused
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSelectOpen = (open: boolean) => {
    setIsOpen(open);
    
    // If opening the select, focus the search input after a small delay
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <Select 
      value={value} 
      onValueChange={onValueChange} 
      open={isOpen}
      onOpenChange={handleSelectOpen}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="min-w-[240px]" onCloseAutoFocus={(e) => {
        // Prevent automatic focus on close to avoid focus issues
        e.preventDefault();
      }}>
        <div className="p-2">
          <ProductSearch 
            searchTerm={searchTerm} 
            onSearch={handleSearch} 
            inputRef={searchInputRef}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <SelectItem 
                key={item.id} 
                value={item.id}
                onMouseDown={(e) => {
                  // Prevent focus loss when selecting an item
                  e.preventDefault();
                }}
              >
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
