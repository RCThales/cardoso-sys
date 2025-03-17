
import { Input } from "../ui/input";
import { PersonalInfo } from "./components/PersonalInfo";
import { AddressInfo } from "./components/AddressInfo";
import { ClientFormProps } from "./types/clientForm";
import { Button } from "../ui/button";
import { SearchClientDialog } from "./SearchClientDialog";
import { useState } from "react";
import { Search } from "lucide-react";
import { Separator } from "../ui/separator";

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

        <div className="space-y-4">
          <h3 className="font-medium text-lg">Informações Pessoais</h3>
          <PersonalInfo
            clientData={clientData}
            onClientDataChange={onClientDataChange}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Endereço</h3>
          <AddressInfo
            clientData={clientData}
            onClientDataChange={onClientDataChange}
          />
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
