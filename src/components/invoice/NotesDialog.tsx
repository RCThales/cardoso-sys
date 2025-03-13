
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: number;
  initialNotes: string | null;
  onNotesSaved: () => void;
}

export const NotesDialog = ({
  open,
  onOpenChange,
  invoiceId,
  initialNotes,
  onNotesSaved,
}: NotesDialogProps) => {
  const [notes, setNotes] = useState<string>(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Update notes when initialNotes changes
    setNotes(initialNotes || "");
  }, [initialNotes]);

  const handleSave = async () => {
    if (!invoiceId) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ notes })
        .eq("id", invoiceId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Notas salvas",
        description: "As notas foram salvas com sucesso",
      });
      
      onNotesSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Erro ao salvar notas",
        description: "Ocorreu um erro ao salvar as notas",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notas da Fatura</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Adicione notas sobre esta fatura..."
            className="min-h-[150px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
