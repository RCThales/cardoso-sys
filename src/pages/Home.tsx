import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  LineChart,
  Package,
  ShoppingBag,
  DollarSign,
  Wallet,
  Users,
  Smartphone,
} from "lucide-react";

const menuItems = [
  {
    title: "WhatsApp",
    description: "Abrir chat",
    icon: Smartphone,
    route: "https://web.whatsapp.com/",
    color: "bg-gradient-to-br from-green-500 to-emerald-500",
  },
  {
    title: "Aluguel",
    description: "Calculadora de aluguéis",
    icon: Calculator,
    route: "/rentals",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    title: "Vendas",
    description: "Venda de Produtos",
    icon: DollarSign,
    route: "/sales",
    color: "bg-gradient-to-br from-teal-500 to-slate-700",
  },
  {
    title: "Faturas",
    description: "Lista de faturas",
    icon: LineChart,
    route: "/invoices/history",
    color: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    title: "Estoque",
    description: "Controle de estoque",
    icon: Package,
    route: "/inventory",
    color: "bg-gradient-to-br from-red-500 to-red-700",
  },
  {
    title: "Financeiro",
    description: "Análise financeira",
    icon: DollarSign,
    route: "/financial",
    color: "bg-gradient-to-br from-yellow-500 to-orange-500",
  },
  {
    title: "Gastos",
    description: "Controle de gastos",
    icon: Wallet,
    route: "/investments",
    color: "bg-gradient-to-br from-red-500 to-pink-500",
  },
  {
    title: "Produtos",
    description: "Gerenciamento de produtos",
    icon: ShoppingBag,
    route: "/products",
    color: "bg-gradient-to-br from-teal-500 to-emerald-500",
  },
  {
    title: "Clientes",
    description: "Gerenciamento de clientes",
    icon: Users,
    route: "/clients",
    color: "bg-gradient-to-br from-purple-500 to-indigo-500",
  },
] as const;

const openWhatsApp = () => {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isAndroid) {
    // Attempt to open WhatsApp Business on Android
    window.location.href =
      "intent://send/#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end;";

    // Fallback to regular WhatsApp if WhatsApp Business isn't installed
    setTimeout(() => {
      window.location.href =
        "intent://send/#Intent;scheme=whatsapp;package=com.whatsapp;end;";
    }, 500); // Adjust the timeout if necessary
  } else if (isIOS) {
    // Attempt to open WhatsApp Business on iOS
    window.location.href = "whatsapp://";

    // Fallback to regular WhatsApp if WhatsApp Business isn't installed
    setTimeout(() => {
      window.location.href = "whatsapp://";
    }, 500); // Adjust the timeout if necessary
  } else {
    // Open WhatsApp Web as a fallback
    window.location.href = "https://wa.me/";
  }
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Bem-vindo(a)</h1>
        <p className="text-muted-foreground mb-8">
          Selecione uma opção abaixo para começar
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Card
              key={item.title}
              className={`cursor-pointer hover:scale-105 transition-transform ${item.color}`}
              onClick={
                item.title === "WhatsApp"
                  ? openWhatsApp
                  : () => navigate(item.route)
              }
            >
              <div className="p-6 flex flex-col h-full text-white">
                <div className="flex-grow flex items-center justify-center">
                  <item.icon className="h-12 w-12" />
                </div>
                <h2 className="text-lg font-semibold mt-4 text-center">
                  {item.title}
                </h2>
                <p className="text-sm mt-2 text-center text-white/80">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
