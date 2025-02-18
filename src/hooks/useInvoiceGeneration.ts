
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import type { InvoiceItem } from "@/components/invoice/types";

interface ClientData {
  name: string;
  cpf: string;
  phone: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  city: string;
  state: string;
  postalCode: string;
  isPaid: boolean;
  deliveryFee: number;
}

export const useInvoiceGeneration = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    cpf: "",
    phone: "",
    address: "",
    addressNumber: "",
    addressComplement: "",
    city: "",
    state: "",
    postalCode: "",
    isPaid: false,
    deliveryFee: 0,
  });

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
    
    const total = itemsTotal + (clientData.deliveryFee || 0);
    
    return total;
  };

  const generateInvoice = async () => {
    try {
      if (!clientData.name || !clientData.postalCode || !clientData.cpf || !clientData.phone) {
        toast({
          title: "Erro",
          description: "Nome, CEP, CPF e telefone são obrigatórios",
          variant: "destructive",
        });
        return;
      }

      if (items.length === 0) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos um item à fatura",
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
      const invoiceNumber = `INV-${Date.now()}`;
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + 30);

      const allItems = [
        ...items.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          total: Number(item.total) || 0
        })),
        {
          description: "Frete",
          quantity: 1,
          price: clientData.deliveryFee,
          total: clientData.deliveryFee,
          productId: "delivery-fee",
          rentalDays: 1
        }
      ] as Json;

      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        client_name: clientData.name,
        client_cpf: clientData.cpf,
        client_phone: clientData.phone,
        client_address: clientData.address,
        client_address_number: clientData.addressNumber,
        client_address_complement: clientData.addressComplement,
        client_city: clientData.city,
        client_state: clientData.state,
        client_postal_code: clientData.postalCode,
        invoice_date: format(today, "yyyy-MM-dd"),
        due_date: format(dueDate, "yyyy-MM-dd"),
        payment_terms: "30 dias",
        items: allItems,
        subtotal: total,
        total,
        is_paid: clientData.isPaid,
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
        cpf: "",
        phone: "",
        address: "",
        addressNumber: "",
        addressComplement: "",
        city: "",
        state: "",
        postalCode: "",
        isPaid: false,
        deliveryFee: 0,
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
    setItems,
    clientData,
    setClientData,
    addItem,
    updateItem,
    removeItem,
    calculateSubtotal,
    generateInvoice,
  };
};
