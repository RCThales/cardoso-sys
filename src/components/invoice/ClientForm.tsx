
import { Input } from "../ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "../ui/select";
import { ESTADOS_BRASILEIROS, fetchAddressByCep } from "@/utils/brazilianStates";
import { useState } from "react";
import { useToast } from "../ui/use-toast";

interface ClientData {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

interface ClientFormProps {
  clientData: ClientData;
  onClientDataChange: (data: ClientData) => void;
}

export const ClientForm = ({ clientData, onClientDataChange }: ClientFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCepChange = async (cep: string) => {
    if (cep.length === 8) {
      setIsLoading(true);
      try {
        const address = await fetchAddressByCep(cep);
        onClientDataChange({
          ...clientData,
          postalCode: cep,
          address: address.street,
          city: address.city,
          state: address.state
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "CEP não encontrado",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Cliente</label>
        <Input
          value={clientData.name}
          onChange={(e) =>
            onClientDataChange({ ...clientData, name: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">CEP</label>
        <Input
          value={clientData.postalCode}
          onChange={(e) => {
            const cep = e.target.value.replace(/\D/g, '');
            handleCepChange(cep);
            onClientDataChange({ ...clientData, postalCode: cep });
          }}
          placeholder="Digite o CEP"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Endereço</label>
        <Input
          value={clientData.address}
          onChange={(e) =>
            onClientDataChange({ ...clientData, address: e.target.value })
          }
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Cidade</label>
        <Input
          value={clientData.city}
          onChange={(e) =>
            onClientDataChange({ ...clientData, city: e.target.value })
          }
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Estado</label>
        <Select 
          value={clientData.state}
          onValueChange={(value) => 
            onClientDataChange({ ...clientData, state: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um estado" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_BRASILEIROS.map((estado) => (
              <SelectItem key={estado.value} value={estado.value}>
                {estado.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
