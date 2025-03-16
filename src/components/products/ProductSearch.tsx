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
      <input
        className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        placeholder="Buscar por nome ou código do produto..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        ref={inputRef}
        onClick={(e) => {
          // Prevent event propagation to avoid closing the dropdown
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          // Prevent default behavior for arrow keys and Enter to keep focus in the input
          if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
            e.stopPropagation();
          }
        }}
        autoComplete="off" // Disable browser autocomplete
      />
    </div>
  );
};
