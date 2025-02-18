import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Hand } from "lucide-react";

interface SortableSizeItemProps {
  size: string;
  quantity: number;
  onQuantityChange: (value: string) => void;
  onRemove: () => void;
}

export const SortableSizeItem = ({
  size,
  quantity,
  onQuantityChange,
  onRemove,
}: SortableSizeItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: size });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 mb-2"
    >
      <Badge
        variant="secondary"
        className="px-1 py-1  cursor-grab"
        {...attributes}
        {...listeners}
      >
        <Hand className="h-5 w-5" />
      </Badge>

      <p className="font-bold"> {size}</p>

      <Input
        type="number"
        min="0"
        value={quantity}
        onChange={(e) => onQuantityChange(e.target.value)}
        placeholder="Quantidade"
        className="w-32"
      />
      <span className="text-sm text-muted-foreground">unidades</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 hover:text-destructive ml-auto"
      >
        <X className="h-3 w-3 " />
      </button>
    </div>
  );
};
