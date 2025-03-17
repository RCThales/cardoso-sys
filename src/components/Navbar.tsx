
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { CartDrawer } from "./cart/CartDrawer";
import { handleLogout } from "../utils/Logout";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const showCart = ["/rentals", "/sales"].includes(location.pathname);

  return (
    <div className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Link to="/" className="hover:scale-[1.03] transition-all">
          <img src="/logo_cardoso.svg" alt="CARDOSO's logo" width={180} />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleLogout(navigate)}
          className="dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <LogOut className="h-5 w-5" />
        </Button>

        {showCart && <CartDrawer />}
      </div>
    </div>
  );
}
