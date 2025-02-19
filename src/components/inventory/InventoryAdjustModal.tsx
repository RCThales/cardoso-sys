import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

interface InventoryAdjustModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: number;
    total_quantity: number;
    rented_quantity: number;
  };
  product:
    | {
        name: string;
        product_code: string;
      }
    | undefined;
  onUpdateQuantity: (
    itemId: number,
    change: number,
    adjustValue: number
  ) => void;
  isUpdating: boolean;
}

export const InventoryAdjustModal = ({
  open,
  onOpenChange,
  item,
  product,
  onUpdateQuantity,
  isUpdating,
}: InventoryAdjustModalProps) => {
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const availableQuantity = item.total_quantity - item.rented_quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[120px]">
        <DialogHeader>
          <DialogTitle>Ajustar Quantidade - {product?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4 ">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="w-[120px] ">
              <span className="text-muted-foreground">Código:</span>
              <p className="font-medium truncate">{product?.product_code}</p>
            </div>
            <div className="w-[120px]">
              <span className="text-muted-foreground">Quantidade Total:</span>
              <p className="font-medium truncate">{item.total_quantity}</p>
            </div>
            <div className="w-[120px]">
              <span className="text-muted-foreground">Quantidade Alugada:</span>
              <p className="font-medium truncate">{item.rented_quantity}</p>
            </div>
            <div className="w-[120px]">
              <span className="text-muted-foreground">
                Quantidade Disponível:
              </span>
              <p className="font-medium truncate">{availableQuantity}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="adjustQuantity" className="text-sm font-medium">
              Quantidade a ajustar:
            </label>
            <Input
              id="adjustQuantity"
              type="number"
              min="1"
              value={adjustQuantity}
              onChange={(e) =>
                setAdjustQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full"
            />
          </div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              className="w-[calc(50%-0.5rem)]"
              onClick={() => onUpdateQuantity(item.id, -1, adjustQuantity)}
              disabled={
                isUpdating || item.total_quantity <= item.rented_quantity
              }
            >
              <Minus className="h-4 w-4 mr-2" />
              Remover
            </Button>
            <Button
              variant="outline"
              className="w-[calc(50%-0.5rem)]"
              onClick={() => onUpdateQuantity(item.id, 1, adjustQuantity)}
              disabled={isUpdating}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
