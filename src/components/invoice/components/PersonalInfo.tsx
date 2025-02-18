
import { Input } from "../../ui/input";
import { formatCPF, formatPhone } from "@/utils/formatters";
import { ClientData } from "../types/clientForm";

interface PersonalInfoProps {
  clientData: ClientData;
  onClientDataChange: (data: ClientData) => void;
}

export const PersonalInfo = ({ clientData, onClientDataChange }: PersonalInfoProps) => {
  const handleCPFChange = (value: string) => {
    const formattedCPF = formatCPF(value);
    onClientDataChange({ ...clientData, cpf: formattedCPF });
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhone(value);
    onClientDataChange({ ...clientData, phone: formattedPhone });
  };

  return (
    <>
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
    </>
  );
};
