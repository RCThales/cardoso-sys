import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

interface DeleteInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  invoiceNumber: string;
}

export const DeleteInvoiceDialog = ({
  open,
  onOpenChange,
  onConfirm,
  invoiceNumber,
}: DeleteInvoiceDialogProps) => {
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setInputValue(""); // Reseta o input quando o modal fecha
    }
  }, [open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(invoiceNumber);
    toast({
      title: "Número copiado!",
      description: `O número da fatura ${invoiceNumber} foi copiado para a área de transferência.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a fatura{" "}
            <span
              className="font-bold text-red-500 cursor-pointer underline"
              onClick={handleCopy}
              title="Clique para copiar"
            >
              {invoiceNumber}
            </span>
            ? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700">
            Digite o número da fatura para confirmar:
          </label>
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite o número da fatura"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={inputValue !== invoiceNumber}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
