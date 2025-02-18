
import { Input } from "../../ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "../../ui/select";
import { ESTADOS_BRASILEIROS, fetchAddressByCep } from "@/utils/brazilianStates";
import { useState } from "react";
import { useToast } from "../../ui/use-toast";
import { ClientData } from "../types/clientForm";

interface AddressInfoProps {
  clientData: ClientData;
  onClientDataChange: (data: ClientData) => void;
}

export const AddressInfo = ({ clientData, onClientDataChange }: AddressInfoProps) => {
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
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">CEP *</label>
        <Input
          required
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
        <label className="text-sm font-medium">Número (Opcional)</label>
        <Input
          value={clientData.addressNumber}
          onChange={(e) =>
            onClientDataChange({ ...clientData, addressNumber: e.target.value })
          }
          placeholder="Número"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Complemento (Opcional)</label>
        <Input
          value={clientData.addressComplement}
          onChange={(e) =>
            onClientDataChange({ ...clientData, addressComplement: e.target.value })
          }
          placeholder="Complemento"
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
    </>
  );
};
