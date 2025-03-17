
import { Input } from "../../ui/input";
import { formatCPF, formatPhone } from "@/utils/formatters";
import { ClientData } from "../types/clientForm";
import { validateCPF } from "@/utils/validateCPF";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CPFConfirmDialog } from "../CPFConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Info } from "lucide-react";

interface PersonalInfoProps {
  clientData: ClientData;
  onClientDataChange: (data: ClientData) => void;
}

export const PersonalInfo = ({
  clientData,
  onClientDataChange,
}: PersonalInfoProps) => {
  const { toast } = useToast();
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    cpf: false,
    phone: false,
  });
  const [showCPFConfirm, setShowCPFConfirm] = useState(false);
  const [existingClientName, setExistingClientName] = useState("");
  const [confirmedCPF, setConfirmedCPF] = useState<string | null>(null);
  const [showLoyaltyAlert, setShowLoyaltyAlert] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [originalClientData, setOriginalClientData] = useState<ClientData | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("clientData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Atualiza o estado apenas se os dados armazenados não estiverem vazios
      if (Object.keys(parsedData).length > 0) {
        onClientDataChange(parsedData);
      }
    }
  }, []);

  useEffect(() => {
    // Verifica se pelo menos um campo foi preenchido antes de salvar no sessionStorage
    if (
      clientData &&
      (clientData.name.trim() !== "" ||
        clientData.cpf.trim() !== "" ||
        clientData.phone.trim() !== "")
    ) {
      sessionStorage.setItem("clientData", JSON.stringify(clientData));
    }
  }, [clientData]);

  const handleBlur = async (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    if (field === "cpf" && clientData.cpf && validateCPF(clientData.cpf)) {
      await checkExistingCPF(clientData.cpf);
    }
  };

  const checkExistingCPF = async (cpf: string) => {
    if (confirmedCPF === cpf) return;

    const { data, error } = await supabase
      .from("invoices")
      .select("client_name, id, client_phone, client_address, client_address_number, client_address_complement, client_neighborhood, client_city, client_state, client_postal_code")
      .eq("client_cpf", cpf);

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
      setOrderCount(data.length);
      
      // Store original client data for comparison when saving
      setOriginalClientData({
        name: data[0].client_name,
        cpf: cpf,
        phone: data[0].client_phone,
        address: data[0].client_address,
        addressNumber: data[0].client_address_number || "",
        addressComplement: data[0].client_address_complement || "",
        neighborhood: data[0].client_neighborhood || "",
        city: data[0].client_city,
        state: data[0].client_state,
        postalCode: data[0].client_postal_code,
        isPaid: false,
        deliveryFee: 0,
        specialDiscount: 0,
      });
      
      setShowCPFConfirm(true);
      if (data.length % 10 === 0) {
        setShowLoyaltyAlert(true);
      }
    }
  };

  const handleCPFChange = (value: string) => {
    onClientDataChange({ ...clientData, cpf: formatCPF(value) });
  };

  const handlePhoneChange = (value: string) => {
    onClientDataChange({ ...clientData, phone: formatPhone(value) });
  };

  const handleCPFConfirm = () => {
    setConfirmedCPF(clientData.cpf);
    
    // When confirming the CPF, also load all the client data
    if (originalClientData) {
      onClientDataChange({ 
        ...originalClientData,
        isPaid: clientData.isPaid,
        deliveryFee: clientData.deliveryFee,
        specialDiscount: clientData.specialDiscount
      });
      
      // Notify user that client data was loaded
      toast({
        title: "Dados do cliente carregados",
        description: "Os dados do cliente foram carregados automaticamente. Qualquer alteração será salva na próxima fatura.",
        duration: 5000,
      });
    }
    
    setShowCPFConfirm(false);
  };

  const handleCPFCancel = () => {
    setShowCPFConfirm(false);
    onClientDataChange({ ...clientData, cpf: "" });
  };

  const isCPFValid = validateCPF(clientData.cpf);
  const isPhoneValid = clientData.phone.replace(/\D/g, "").length === 11;

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
          onBlur={() => handleBlur("name")}
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
          onBlur={() => handleBlur("cpf")}
          placeholder="000.000.000-00"
          maxLength={14}
          className={cn({ "border-red-500": touchedFields.cpf && !isCPFValid })}
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
          onBlur={() => handleBlur("phone")}
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
        onCancel={handleCPFCancel}
        clientName={existingClientName}
      />

      <AlertDialog open={showLoyaltyAlert} onOpenChange={setShowLoyaltyAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" /> Cliente
              Fiel!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Este cliente completou {orderCount} pedidos! Considere oferecer um
              desconto especial como agradecimento pela fidelidade.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
