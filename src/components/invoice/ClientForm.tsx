
import { Input } from "../ui/input";

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
        <label className="text-sm font-medium">Endereço</label>
        <Input
          value={clientData.address}
          onChange={(e) =>
            onClientDataChange({ ...clientData, address: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Cidade</label>
        <Input
          value={clientData.city}
          onChange={(e) =>
            onClientDataChange({ ...clientData, city: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Estado</label>
        <Input
          value={clientData.state}
          onChange={(e) =>
            onClientDataChange({ ...clientData, state: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">CEP</label>
        <Input
          value={clientData.postalCode}
          onChange={(e) =>
            onClientDataChange({ ...clientData, postalCode: e.target.value })
          }
        />
      </div>
    </div>
  );
};
