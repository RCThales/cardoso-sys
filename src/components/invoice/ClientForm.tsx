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
import { formatCPF, formatPhone } from "@/utils/formatters";

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

  const handleCPFChange = (value: string) => {
    const formattedCPF = formatCPF(value);
    onClientDataChange({ ...clientData, cpf: formattedCPF });
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhone(value);
    onClientDataChange({ ...clientData, phone: formattedPhone });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Cliente *</label>
        <Input
          required
          value={clientData.name}
          onChange={(e) =>
            onClientDataChange({ ...clientData, name: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">CPF *</label>
        <Input
          required
          value={clientData.cpf}
          onChange={(e) => handleCPFChange(e.target.value)}
          placeholder="000.000.000-00"
          maxLength={14}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Telefone *</label>
        <Input
          required
          value={clientData.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="(00) 00000-0000"
          maxLength={15}
        />
      </div>

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

      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium flex items-center space-x-2">
          <Input
            type="checkbox"
            className="w-4 h-4"
            checked={clientData.isPaid}
            onChange={(e) =>
              onClientDataChange({ ...clientData, isPaid: e.target.checked })
            }
          />
          <span>Fatura Paga</span>
        </label>
      </div>
    </div>
  );
};
