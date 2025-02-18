
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/formatters";

interface ExpenseDetail {
  description: string;
  amount: number;
}

interface FinancialDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  details: ExpenseDetail[];
  total: number;
}

export const FinancialDetailsDialog = ({
  open,
  onOpenChange,
  title,
  details,
  total,
}: FinancialDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {details.map((detail, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b last:border-b-0"
            >
              <span className="text-sm text-muted-foreground">
                {detail.description}
              </span>
              <span className="font-medium">
                R$ {formatCurrency(detail.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 border-t border-t-2">
            <span className="font-bold">Total</span>
            <span className="font-bold">R$ {formatCurrency(total)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
