
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CPFConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  clientName: string;
}

export const CPFConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  clientName,
}: CPFConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>CPF já cadastrado</DialogTitle>
          <DialogDescription>
            Encontramos um cadastro existente com este CPF para o cliente:{" "}
            <span className="font-semibold">{clientName}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Confirmar e Prosseguir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
