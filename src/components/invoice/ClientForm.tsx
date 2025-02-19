import { Input } from "../ui/input";
import { PersonalInfo } from "./components/PersonalInfo";
import { AddressInfo } from "./components/AddressInfo";
import { ClientFormProps } from "./types/clientForm";
import { Button } from "../ui/button";
import { SearchClientDialog } from "./SearchClientDialog";
import { useState } from "react";
import { Search } from "lucide-react";

export const ClientForm = ({
  clientData,
  onClientDataChange,
}: ClientFormProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="md:grid md:grid-cols-2 gap-4">
        <div className="col-span-2 flex justify-end">
          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            className="mb-4"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar Cliente
          </Button>
        </div>

        <PersonalInfo
          clientData={clientData}
          onClientDataChange={onClientDataChange}
        />
        <AddressInfo
          clientData={clientData}
          onClientDataChange={onClientDataChange}
        />

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

      <SearchClientDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onClientSelect={onClientDataChange}
      />
    </>
  );
};
