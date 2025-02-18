
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

interface SortableSizeItemProps {
  size: string;
  quantity: number;
  onQuantityChange: (value: string) => void;
  onRemove: () => void;
}

export const SortableSizeItem = ({ size, quantity, onQuantityChange, onRemove }: SortableSizeItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: size });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 mb-2">
      <Badge variant="secondary" className="px-2 py-1 min-w-[60px] cursor-grab" {...attributes} {...listeners}>
        {size}
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
      <Input
        type="number"
        min="0"
        value={quantity}
        onChange={(e) => onQuantityChange(e.target.value)}
        placeholder="Quantidade"
        className="w-32"
      />
      <span className="text-sm text-muted-foreground">unidades</span>
    </div>
  );
};
