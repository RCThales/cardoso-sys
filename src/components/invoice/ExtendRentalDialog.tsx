import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { useEffect } from "react";

interface ExtendRentalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (days: number, additionalCost: number, discount: number) => void;
  calculateAdditionalCost: (days: number) => Promise<number>; // Fix: Ensure it's an async function
}

export const ExtendRentalDialog = ({
  open,
  onOpenChange,
  onConfirm,
  calculateAdditionalCost,
}: ExtendRentalDialogProps) => {
  const [days, setDays] = useState(1);
  const [previousValue, setPreviousValue] = useState("1");
  const [additionalCost, setAdditionalCost] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const fetchAdditionalCost = async () => {
      const cost = await calculateAdditionalCost(days);
      setAdditionalCost(cost);
    };
    fetchAdditionalCost();
  }, [days, calculateAdditionalCost]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === "") {
      setDays(0); // Temporariamente vazio
      return;
    }
    const newDaysValue = parseInt(newValue, 10);
    if (newDaysValue >= 1) {
      setDays(Math.max(1, parseInt(e.target.value) || 1));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (days === 0) {
      setDays(1); // Se estiver vazio ao perder o foco, volta para 1
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === "") {
      setDiscount(0); // Temporariamente vazio
      return;
    }
    const newDiscountValue = parseFloat(e.target.value) || 0;
    if (newDiscountValue >= 1) {
      setDiscount(Math.max(0, Math.min(newDiscountValue, additionalCost))); // Ensure discount doesn't exceed cost
    }
  };

  const finalCost = Math.max(0, additionalCost - discount);

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
              min={0}
              value={days === 0 ? "" : days}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Desconto:</label>
            <Input
              type="number"
              min={0}
              max={additionalCost}
              value={discount === 0 ? "" : discount}
              onChange={handleDiscountChange}
              onBlur={() => {
                if (discount === 0) {
                  setDiscount(0); // Se estiver vazio ao perder o foco, volta para 1
                }
              }}
              placeholder="0.00"
            />
          </div>

          <div className="p-4 bg-muted rounded-md space-y-2">
            <div className="flex justify-between font-medium">
              <span>Custo Adicional:</span>
              <span>R$ {formatCurrency(additionalCost)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Desconto:</span>
                <span>- R$ {formatCurrency(discount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span>Total:</span>
              <span>R$ {formatCurrency(finalCost)}</span>
            </div>
          </div>

          <Button
            onClick={() => onConfirm(days, finalCost, discount)}
            className="w-full"
          >
            Confirmar Extensão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
