
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface CPFConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  clientName: string;
}

export const CPFConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  clientName,
}: CPFConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Cliente cadastrado encontrado
          </DialogTitle>
          <DialogDescription>
            <p className="mb-2">
              Encontramos um cadastro existente com este CPF para o cliente:{" "}
              <span className="font-semibold">{clientName}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Ao confirmar, os dados cadastrais do cliente serão carregados. Se você fizer alguma alteração, todos os registros deste cliente serão atualizados no sistema quando a fatura for gerada.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Carregar dados do cliente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
