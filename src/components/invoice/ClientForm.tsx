
import { Input } from "../ui/input";
import { PersonalInfo } from "./components/PersonalInfo";
import { AddressInfo } from "./components/AddressInfo";
import { ClientFormProps } from "./types/clientForm";

export const ClientForm = ({ clientData, onClientDataChange }: ClientFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PersonalInfo clientData={clientData} onClientDataChange={onClientDataChange} />
      <AddressInfo clientData={clientData} onClientDataChange={onClientDataChange} />
      
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
