
import { Calculator } from "lucide-react";
import { LocaleToggle } from "./LocaleToggle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex gap-2 items-center mr-4">
          <Calculator className="h-6 w-6" />
          <span className="font-semibold">Cardoso Calc</span>
        </div>
        <div className="flex-1" />
        <LocaleToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="ml-4"
        >
          Sair
        </Button>
      </div>
    </nav>
  );
};
