import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvestmentForm } from "./InvestmentForm";
import { Plus } from "lucide-react";

interface AddInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (formData: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editingItem: any | null;
  activeTab: "investments" | "expenses" | "recurrings";
  buttonLabel: string;
  dialogTitle: string;
}

export const AddInvestmentDialog = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  editingItem,
  activeTab,
  buttonLabel,
  dialogTitle,
}: AddInvestmentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <InvestmentForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          editingItem={editingItem}
          activeTab={activeTab}
        />
      </DialogContent>
    </Dialog>
  );
};
