
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";

interface CancelRecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  itemName: string;
}

export const CancelRecurringDialog = ({
  open,
  onOpenChange,
  onConfirm,
  itemName,
}: CancelRecurringDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleConfirm = () => {
    if (selectedDate) {
      onConfirm(selectedDate);
    }
    setConfirmDialogOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] md:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancelar recorrência</DialogTitle>
            <DialogDescription>
              Selecione a data até quando esta recorrência será válida para "{itemName}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium">Data de encerramento:</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setConfirmDialogOpen(true)}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmar cancelamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja encerrar a recorrência de "{itemName}" em{" "}
              {selectedDate
                ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : "data selecionada"}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
