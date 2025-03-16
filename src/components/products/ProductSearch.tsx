
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { RefObject } from "react";

interface ProductSearchProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  inputRef?: RefObject<HTMLInputElement>;
}

export const ProductSearch = ({ 
  searchTerm, 
  onSearch,
  inputRef 
}: ProductSearchProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        className="pl-10"
        placeholder="Buscar por nome ou código do produto..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        ref={inputRef}
        onClick={(e) => {
          // Prevent event propagation to avoid closing the dropdown
          e.stopPropagation();
        }}
      />
    </div>
  );
};
