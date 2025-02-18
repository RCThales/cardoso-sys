
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import type { InvoiceItem } from "@/components/invoice/InvoiceItems";

interface ClientData {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export const useInvoiceGeneration = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, price: 0, total: 0 },
    ]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === "quantity" || field === "price") {
      item[field] = Number(value);
      item.total = item.quantity * item.price;
    } else {
      (item as any)[field] = value;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const generateInvoice = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para gerar faturas",
          variant: "destructive",
        });
        return;
      }

      const subtotal = calculateSubtotal();
      const total = subtotal;
      const invoiceNumber = `INV-${Date.now()}`;
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + 30);

      const itemsForDb = items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.total)
      })) as Json;

      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        client_name: clientData.name,
        client_address: clientData.address,
        client_city: clientData.city,
        client_state: clientData.state,
        client_postal_code: clientData.postalCode,
        invoice_date: format(today, "yyyy-MM-dd"),
        due_date: format(dueDate, "yyyy-MM-dd"),
        payment_terms: "30 dias",
        items: itemsForDb,
        subtotal,
        total,
        balance_due: total,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Fatura gerada com sucesso",
      });

      // Limpar formulário
      setItems([]);
      setClientData({
        name: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar fatura",
        variant: "destructive",
      });
    }
  };

  return {
    items,
    clientData,
    setClientData,
    addItem,
    updateItem,
    calculateSubtotal,
    generateInvoice,
  };
};
