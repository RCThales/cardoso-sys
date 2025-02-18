
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <div className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link to="/" className="text-lg font-semibold">
        Cardoso Aluguel de Muletas
      </Link>
    </div>
  );
}
