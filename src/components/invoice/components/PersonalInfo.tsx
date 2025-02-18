
import { Input } from "../../ui/input";
import { formatCPF, formatPhone } from "@/utils/formatters";
import { ClientData } from "../types/clientForm";
import { validateCPF } from "@/utils/validateCPF";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CPFConfirmDialog } from "../CPFConfirmDialog";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfoProps {
  clientData: ClientData;
  onClientDataChange: (data: ClientData) => void;
}

export const PersonalInfo = ({ clientData, onClientDataChange }: PersonalInfoProps) => {
  const { toast } = useToast();
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    cpf: false,
    phone: false
  });
  const [showCPFConfirm, setShowCPFConfirm] = useState(false);
  const [existingClientName, setExistingClientName] = useState("");
  const [confirmedCPF, setConfirmedCPF] = useState<string | null>(null);

  const handleBlur = async (field: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));

    if (field === 'cpf' && clientData.cpf && validateCPF(clientData.cpf)) {
      await checkExistingCPF(clientData.cpf);
    }
  };

  const checkExistingCPF = async (cpf: string) => {
    if (confirmedCPF === cpf) return; // Se o CPF já foi confirmado, não verifica novamente

    const { data, error } = await supabase
      .from("invoices")
      .select("client_name")
      .eq("client_cpf", cpf)
      .limit(1);

    if (error) {
      toast({
        title: "Erro ao verificar CPF",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      setExistingClientName(data[0].client_name);
      setShowCPFConfirm(true);
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

  const handleCPFConfirm = () => {
    setConfirmedCPF(clientData.cpf);
    setShowCPFConfirm(false);
  };

  const isCPFValid = validateCPF(clientData.cpf);
  const isPhoneValid = clientData.phone.replace(/\D/g, '').length === 11;

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
            "border-red-500": touchedFields.phone && !isPhoneValid,
          })}
        />
        {touchedFields.phone && !isPhoneValid && (
          <p className="text-sm text-red-500">Telefone inválido</p>
        )}
      </div>

      <CPFConfirmDialog
        open={showCPFConfirm}
        onOpenChange={setShowCPFConfirm}
        onConfirm={handleCPFConfirm}
        clientName={existingClientName}
      />
    </>
  );
};
