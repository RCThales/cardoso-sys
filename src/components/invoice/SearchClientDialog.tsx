
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatCPF } from "@/utils/formatters";
import { ClientData } from "./types/clientForm";
import { useToast } from "../ui/use-toast";

interface SearchClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientSelect: (client: ClientData) => void;
}

interface ClientSearchResult {
  client_name: string;
  client_cpf: string;
  client_phone: string;
  client_address: string;
  client_address_number: string;
  client_address_complement: string;
  client_city: string;
  client_state: string;
  client_postal_code: string;
}

export const SearchClientDialog = ({
  open,
  onOpenChange,
  onClientSelect,
}: SearchClientDialogProps) => {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && search.length >= 3) {
      searchClients();
    }
  }, [search, open]);

  const searchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("client_name, client_cpf, client_phone, client_address, client_address_number, client_address_complement, client_city, client_state, client_postal_code")
      .or(`client_name.ilike.%${search}%,client_cpf.ilike.%${search}%`)
      .order("client_name")
      .limit(10);

    if (error) {
      toast({
        title: "Erro ao buscar clientes",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Remove duplicatas baseado no CPF
    const uniqueClients = data.reduce((acc: ClientSearchResult[], current) => {
      const exists = acc.find(client => client.client_cpf === current.client_cpf);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    setClients(uniqueClients);
    setLoading(false);
  };

  const handleClientSelect = (client: ClientSearchResult) => {
    onClientSelect({
      name: client.client_name,
      cpf: client.client_cpf,
      phone: client.client_phone,
      address: client.client_address,
      addressNumber: client.client_address_number || "",
      addressComplement: client.client_address_complement || "",
      city: client.client_city,
      state: client.client_state,
      postalCode: client.client_postal_code,
      isPaid: false,
      deliveryFee: 0,
      specialDiscount: 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Buscar Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Digite o nome ou CPF do cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <p className="text-center text-muted-foreground">Buscando...</p>
          ) : (
            <div className="space-y-2">
              {clients.map((client) => (
                <Button
                  key={client.client_cpf}
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="text-left">
                    <p className="font-medium">{client.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      CPF: {formatCPF(client.client_cpf)}
                    </p>
                  </div>
                </Button>
              ))}
              {search.length >= 3 && clients.length === 0 && (
                <p className="text-center text-muted-foreground">
                  Nenhum cliente encontrado
                </p>
              )}
              {search.length < 3 && (
                <p className="text-center text-muted-foreground">
                  Digite pelo menos 3 caracteres para buscar
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
