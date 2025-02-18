
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

interface ExtendRentalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (days: number, additionalCost: number) => void;
  calculateAdditionalCost: (days: number) => number;
}

export const ExtendRentalDialog = ({
  open,
  onOpenChange,
  onConfirm,
  calculateAdditionalCost,
}: ExtendRentalDialogProps) => {
  const [days, setDays] = useState(1);
  const additionalCost = calculateAdditionalCost(days);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Estender Aluguel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dias Adicionais:</label>
            <Input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          
          <div className="p-4 bg-muted rounded-md">
            <div className="flex justify-between font-medium">
              <span>Custo Adicional:</span>
              <span>R$ {formatCurrency(additionalCost)}</span>
            </div>
          </div>

          <Button 
            onClick={() => onConfirm(days, additionalCost)} 
            className="w-full"
          >
            Confirmar Extensão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
