
import { Input } from "../../ui/input";
import { formatCPF, formatPhone } from "@/utils/formatters";
import { ClientData } from "../types/clientForm";
import { validateCPF } from "@/utils/validateCPF";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PersonalInfoProps {
  clientData: ClientData;
  onClientDataChange: (data: ClientData) => void;
}

export const PersonalInfo = ({ clientData, onClientDataChange }: PersonalInfoProps) => {
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    cpf: false,
    phone: false
  });

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleCPFChange = (value: string) => {
    const formattedCPF = formatCPF(value);
    onClientDataChange({ ...clientData, cpf: formattedCPF });
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhone(value);
    onClientDataChange({ ...clientData, phone: formattedPhone });
  };

  const isCPFValid = !clientData.cpf || validateCPF(clientData.cpf);

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
          onBlur={() => handleBlur('name')}
          className={cn({
            "border-red-500": touchedFields.name && clientData.name === "",
          })}
        />
        {touchedFields.name && clientData.name === "" && (
          <p className="text-sm text-red-500">Nome é obrigatório</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">CPF *</label>
        <Input
          required
          value={clientData.cpf}
          onChange={(e) => handleCPFChange(e.target.value)}
          onBlur={() => handleBlur('cpf')}
          placeholder="000.000.000-00"
          maxLength={14}
          className={cn({
            "border-red-500": touchedFields.cpf && !isCPFValid,
          })}
        />
        {touchedFields.cpf && !isCPFValid && (
          <p className="text-sm text-red-500">CPF inválido</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Telefone *</label>
        <Input
          required
          value={clientData.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          onBlur={() => handleBlur('phone')}
          placeholder="(00) 00000-0000"
          maxLength={15}
          className={cn({
            "border-red-500": touchedFields.phone && clientData.phone === "",
          })}
        />
        {touchedFields.phone && clientData.phone === "" && (
          <p className="text-sm text-red-500">Telefone é obrigatório</p>
        )}
      </div>
    </>
  );
};
