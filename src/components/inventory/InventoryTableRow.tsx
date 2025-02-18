
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { TableCell, TableRow } from "../ui/table";
import { Plus, Minus } from "lucide-react";

interface InventoryTableRowProps {
  item: {
    id: number;
    total_quantity: number;
    rented_quantity: number;
    product_id: string;
  };
  product: {
    product_code: string;
    name: string;
  } | undefined;
  adjustQuantity: number;
  isUpdating: boolean;
  onAdjustQuantityChange: (value: string) => void;
  onUpdateQuantity: (change: number) => void;
}

export const InventoryTableRow = ({
  item,
  product,
  adjustQuantity,
  isUpdating,
  onAdjustQuantityChange,
  onUpdateQuantity,
}: InventoryTableRowProps) => {
  const availableQuantity = item.total_quantity - item.rented_quantity;

  return (
    <TableRow>
      <TableCell>{product?.product_code}</TableCell>
      <TableCell>{product?.name}</TableCell>
      <TableCell className="text-right">{item.total_quantity}</TableCell>
      <TableCell className="text-right">{item.rented_quantity}</TableCell>
      <TableCell className="text-right">{availableQuantity}</TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          min="1"
          value={adjustQuantity}
          onChange={(e) => onAdjustQuantityChange(e.target.value)}
          className="w-20 text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQuantity(-1)}
            disabled={isUpdating || item.total_quantity <= item.rented_quantity}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onUpdateQuantity(1)}
            disabled={isUpdating}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
