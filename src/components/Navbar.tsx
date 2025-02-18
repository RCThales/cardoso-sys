import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link to="/" className="text-lg font-semibold">
        Cardoso Aluguel de Muletas
      </Link>
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/calc" className="text-sm font-medium hover:underline">
          Calculadora
        </Link>
        <Link to="/invoices/history" className="text-sm font-medium hover:underline">
          Histórico de Faturas
        </Link>
        <Link to="/inventory" className="text-sm font-medium hover:underline">
          Inventário
        </Link>
         <Link to="/products" className="text-sm font-medium hover:underline">
          Produtos
        </Link>
        <Link to="/financial" className="text-sm font-medium hover:underline">
          Financeiro
        </Link>
        <Link to="/investments" className="text-sm font-medium hover:underline">
          Investimentos
        </Link>
        <Link to="/clients" className="text-sm font-medium hover:underline">
          Clientes
        </Link>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navegue pelas opções do sistema.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <Link to="/calc" className="text-sm font-medium hover:underline">
              Calculadora
            </Link>
            <Link to="/invoices/history" className="text-sm font-medium hover:underline">
              Histórico de Faturas
            </Link>
            <Link to="/inventory" className="text-sm font-medium hover:underline">
              Inventário
            </Link>
            <Link to="/products" className="text-sm font-medium hover:underline">
              Produtos
            </Link>
             <Link to="/financial" className="text-sm font-medium hover:underline">
              Financeiro
            </Link>
            <Link to="/investments" className="text-sm font-medium hover:underline">
              Investimentos
            </Link>
            <Link to="/clients" className="text-sm font-medium hover:underline">
              Clientes
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {
        !isOpen && (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px] md:grid-cols-2">
                    <Link to="/calc">
                      <NavigationMenuLink>Calculadora</NavigationMenuLink>
                    </Link>
                    <Link to="/invoices/history">
                      <NavigationMenuLink>Histórico de Faturas</NavigationMenuLink>
                    </Link>
                    <Link to="/inventory">
                      <NavigationMenuLink>Inventário</NavigationMenuLink>
                    </Link>
                    <Link to="/products">
                      <NavigationMenuLink>Produtos</NavigationMenuLink>
                    </Link>
                    <Link to="/financial">
                      <NavigationMenuLink>Financeiro</NavigationMenuLink>
                    </Link>
                    <Link to="/investments">
                      <NavigationMenuLink>Investimentos</NavigationMenuLink>
                    </Link>
                    <Link to="/clients">
                      <NavigationMenuLink>Clientes</NavigationMenuLink>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )
      }
    </div>
  );
}
