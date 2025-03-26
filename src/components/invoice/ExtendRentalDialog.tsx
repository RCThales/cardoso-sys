import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { useEffect } from "react";

interface ExtendRentalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (days: number, additionalCost: number) => void;
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

  useEffect(() => {
    const fetchAdditionalCost = async () => {
      const cost = await calculateAdditionalCost(days);
      setAdditionalCost(cost);
    };
    fetchAdditionalCost();
  }, [days, calculateAdditionalCost]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDays(Math.max(1, parseInt(value) || 1));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value.trim()) {
      // If the input is empty when blurred, restore the previous value
      setDays(parseInt(previousValue) || 1);
    } else {
      // Save the current value as the previous value
      setPreviousValue(days.toString());
    }
  };

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
              onChange={handleChange}
              onBlur={handleBlur}
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
