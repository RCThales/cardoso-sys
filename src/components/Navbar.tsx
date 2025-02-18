
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <div className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link to="/" className="text-lg font-semibold">
        CARDOSO SYS
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/clients">
          <Button variant="ghost">Clientes</Button>
        </Link>
      </div>
    </div>
  );
}
