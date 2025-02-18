
import { TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";

interface InventoryTableRowProps {
  item: {
    id: number;
    total_quantity: number;
    rented_quantity: number;
    product_id: string;
  };
  product: {
    name: string;
    product_code: string;
  } | undefined;
  onAdjustClick: () => void;
}

export const InventoryTableRow = ({
  item,
  product,
  onAdjustClick,
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
        <Button
          variant="outline"
          size="sm"
          onClick={onAdjustClick}
          className="w-[140px]"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Ajustar Total
        </Button>
      </TableCell>
    </TableRow>
  );
};
