
import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export const InvoiceGenerator = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [clientData, setClientData] = useState({
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

      // Convertendo items para um formato compatível com Json
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

  return (
    <Card className="p-6">
      <div className="text-center mb-6 p-4 border-b">
        <h2 className="text-2xl font-bold">Cardoso Aluguel de Muletas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Rua Exemplo, 123 - Centro
        </p>
        <p className="text-sm text-muted-foreground">
          Cidade - Estado, 12345-678
        </p>
        <p className="text-sm text-muted-foreground">
          CNPJ: XX.XXX.XXX/0001-XX
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Cliente</label>
            <Input
              value={clientData.name}
              onChange={(e) =>
                setClientData({ ...clientData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Endereço</label>
            <Input
              value={clientData.address}
              onChange={(e) =>
                setClientData({ ...clientData, address: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cidade</label>
            <Input
              value={clientData.city}
              onChange={(e) =>
                setClientData({ ...clientData, city: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Input
              value={clientData.state}
              onChange={(e) =>
                setClientData({ ...clientData, state: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CEP</label>
            <Input
              value={clientData.postalCode}
              onChange={(e) =>
                setClientData({ ...clientData, postalCode: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Itens</h3>
            <Button onClick={addItem}>Adicionar Item</Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <Input
                  placeholder="Descrição"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qtd"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Preço"
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  value={`R$ ${item.total.toFixed(2)}`}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 items-center">
          <span className="font-medium">Total:</span>
          <span className="text-xl">
            R$ {calculateSubtotal().toFixed(2)}
          </span>
        </div>

        <div className="flex justify-end">
          <Button onClick={generateInvoice} className="w-full md:w-auto">
            Gerar Fatura
          </Button>
        </div>
      </div>
    </Card>
  );
};
