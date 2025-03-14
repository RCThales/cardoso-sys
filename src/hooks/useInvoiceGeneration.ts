
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
  const [paymentMethod, setPaymentMethod] = useState<string>("Cartão");

  const validateRequiredFields = () => {
    const hasName = !!clientData.name;
    const hasValidPostalCode = clientData.postalCode.length === 8;
    const hasValidPhone = clientData.phone.replace(/\D/g, "").length === 11;
    const hasValidCPF = validateCPF(clientData.cpf);
    const hasItems = items.length > 0;

    return (
      hasName && hasValidPostalCode && hasValidPhone && hasValidCPF && hasItems
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        price: 0,
        total: 0,
        is_sale: false,
        productId: "",
        rentalDays: 1,
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
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
      const itemTotal = typeof item.total === "number" ? item.total : 0;
      return sum + itemTotal;
    }, 0);

    const subtotal = itemsTotal + (clientData.deliveryFee || 0);

    return subtotal - clientData.specialDiscount;
  };

  const generateInvoice = async () => {
    try {
      if (!validateRequiredFields()) {
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
          duration: 3000,
        });
        return;
      }

      const total = calculateSubtotal();

      await updateInventory(items);
      const invoiceCreated = await createInvoice(
        items,
        clientData,
        total,
        user.id,
        paymentMethod
      );

      toast({
        title: "Sucesso!",
        description: "Fatura gerada com sucesso",
        duration: 3000,
      });

      setItems([]);
      setClientData(DEFAULT_CLIENT_DATA);
      return invoiceCreated;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar fatura",
        variant: "destructive",
        duration: 3000,
      });
      console.error(error);
    }
  };

  return {
    items,
    setItems,
    clientData,
    setClientData,
    paymentMethod,
    setPaymentMethod,
    addItem,
    updateItem,
    removeItem,
    calculateSubtotal,
    generateInvoice,
    validateRequiredFields,
  };
};
