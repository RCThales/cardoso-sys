
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Navbar() {
  return (
    <div className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link to="/" className="text-lg font-semibold">
        CARDOSO SYS
      </Link>
      <Button variant="ghost" size="icon">
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
