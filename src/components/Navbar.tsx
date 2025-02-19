import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Accessibility } from "lucide-react";

import { handleLogout } from "../utils/Logout";

export function Navbar() {
  const location = useLocation(); // Obtém a rota atual
  const navigate = useNavigate();
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
            onClick={() => handleLogout(navigate)}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
