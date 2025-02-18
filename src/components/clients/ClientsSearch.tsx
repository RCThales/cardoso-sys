
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ClientsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const ClientsSearch = ({ value, onChange }: ClientsSearchProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por nome ou CPF..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};
