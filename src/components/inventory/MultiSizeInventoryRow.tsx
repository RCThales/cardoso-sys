
import { TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";

interface InventoryItem {
  id: number;
  size: string;
  total_quantity: number;
  rented_quantity: number;
}

interface MultiSizeInventoryRowProps {
  product: {
    product_code: string;
    name: string;
  };
  items: InventoryItem[];
  onAdjust: (item: InventoryItem) => void;
}

export const MultiSizeInventoryRow = ({ product, items, onAdjust }: MultiSizeInventoryRowProps) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.total_quantity, 0);
  const rentedQuantity = items.reduce((sum, item) => sum + item.rented_quantity, 0);
  const availableQuantity = totalQuantity - rentedQuantity;

  return (
    <TableRow>
      <TableCell className="font-medium">{product.product_code}</TableCell>
      <TableCell>
        <div className="font-medium">{product.name}</div>
        <div className="mt-2 space-y-1">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
              <span>{item.size}</span>
              <span className="ml-4">{item.total_quantity - item.rented_quantity} disponíveis</span>
            </div>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right">{totalQuantity}</TableCell>
      <TableCell className="text-right">{rentedQuantity}</TableCell>
      <TableCell className="text-right">{availableQuantity}</TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col space-y-2">
          {items.map(item => (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              onClick={() => onAdjust(item)}
              className="w-[140px]"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {item.size}
            </Button>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
};
