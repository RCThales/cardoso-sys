import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Accessibility } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const location = useLocation(); // Obtém a rota atual

  return (
    <div className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Accessibility className="h-5 w-5 text-gray-500" />
        <Link to="/" className="text-lg font-semibold">
          CARDOSO SYS
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {location.pathname !== "/calc" && ( // Esconde o botão se a rota for /calc
          <Button
            variant="ghost"
            size="icon"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
