import { Accessibility } from "lucide-react";
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
        <div
          className="flex gap-2 items-center mr-4 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Accessibility className="h-8 w-8" />
          <span className="font-semibold">CARDOSO SYS</span>
        </div>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="mr-6"
        >
          Sair
        </Button>
      </div>
    </nav>
  );
};
