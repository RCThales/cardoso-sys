
import { TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";

interface SingleSizeInventoryRowProps {
  product: {
    product_code: string;
    name: string;
  };
  item: {
    total_quantity: number;
    rented_quantity: number;
  };
  onAdjust: () => void;
}

export const SingleSizeInventoryRow = ({ product, item, onAdjust }: SingleSizeInventoryRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{product.product_code}</TableCell>
      <TableCell>
        <div className="font-medium">{product.name}</div>
      </TableCell>
      <TableCell className="text-right">{item.total_quantity}</TableCell>
      <TableCell className="text-right">{item.rented_quantity}</TableCell>
      <TableCell className="text-right">{item.total_quantity - item.rented_quantity}</TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAdjust}
            className="w-[140px]"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Ajustar Total
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
