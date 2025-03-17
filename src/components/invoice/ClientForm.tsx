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
        <div className="col-span-2 flex justify-end ">
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
        <div></div>
        <br />
        <div className="relative py-10 md:py-2">
          {" "}
          <hr className="absolute top-1/2 w-full translate-x-[0px] md:-translate-x-1/2 -translate-y-2 md:translate-y-1/2" />
        </div>

        <AddressInfo
          clientData={clientData}
          onClientDataChange={onClientDataChange}
        />
      </div>

      <SearchClientDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onClientSelect={onClientDataChange}
      />
    </>
  );
};
