
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { InvoiceItem } from "@/components/invoice/types";
import { ClientData, DEFAULT_CLIENT_DATA } from "@/types/invoice";
import { validateCPF } from "@/utils/validateCPF";
import { updateInventory } from "@/services/inventoryService";
import { createInvoice } from "@/services/invoiceService";

export const useInvoiceGeneration = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [clientData, setClientData] = useState<ClientData>(DEFAULT_CLIENT_DATA);

  const validateRequiredFields = () => {
    if (!clientData.name || !clientData.postalCode || !clientData.cpf || !clientData.phone) {
      return false;
    }
    if (!validateCPF(clientData.cpf)) {
      return false;
    }
    if (items.length === 0) {
      return false;
    }
    return true;
  };

  const addItem = () => {
    setItems([
      ...items,
      { 
        description: "", 
        quantity: 1, 
        price: 0, 
        total: 0,
        productId: "",
        rentalDays: 1
      },
    ]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === "quantity" || field === "price" || field === "rentalDays") {
      item[field] = Number(value) || 0;
    } else {
      (item as any)[field] = value;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = (): number => {
    const itemsTotal = items.reduce((sum, item) => {
      const itemTotal = typeof item.total === 'number' ? item.total : 0;
      return sum + itemTotal;
    }, 0);
    
    const subtotal = itemsTotal + (clientData.deliveryFee || 0);
    const discount = (subtotal * clientData.specialDiscount) / 100;
    
    return subtotal - discount;
  };

  const generateInvoice = async () => {
    try {
      if (!validateRequiredFields()) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos obrigatórios e verifique se o CPF é válido",
          variant: "destructive",
        });
        return;
      }

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

      const total = calculateSubtotal();

      await updateInventory(items);
      await createInvoice(items, clientData, total, user.id);

      toast({
        title: "Sucesso!",
        description: "Fatura gerada com sucesso",
      });

      setItems([]);
      setClientData(DEFAULT_CLIENT_DATA);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar fatura",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return {
    items,
    setItems,
    clientData,
    setClientData,
    addItem,
    updateItem,
    removeItem,
    calculateSubtotal,
    generateInvoice,
    validateRequiredFields,
  };
};
