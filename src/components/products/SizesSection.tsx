import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SortableSizeItem } from "./SortableSizeItem";

interface SizesSectionProps {
  sizes: string[];
  newSize: string;
  setNewSize: (size: string) => void;
  quantities: Record<string, number>;
  onAddSize: () => void;
  onRemoveSize: (size: string) => void;
  onQuantityChange: (size: string, value: string) => void;
  onDragEnd: (event: any) => void;
}

export const SizesSection = ({
  sizes,
  newSize,
  setNewSize,
  quantities,
  onAddSize,
  onRemoveSize,
  onQuantityChange,
  onDragEnd,
}: SizesSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tamanhos Disponíveis</label>
      <div className="flex gap-2">
        <Input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value.toUpperCase())}
          placeholder="Ex: P, M, G"
          className="flex-1"
        />
        <Button type="button" onClick={onAddSize}>
          Adicionar
        </Button>
      </div>
      <div className="space-y-2 mt-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={sizes} strategy={verticalListSortingStrategy}>
            {sizes.map((size) => (
              <SortableSizeItem
                key={size}
                size={size}
                quantity={quantities[size] || 0}
                onQuantityChange={(value) => onQuantityChange(size, value)}
                onRemove={() => onRemoveSize(size)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
