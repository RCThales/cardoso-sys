import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  LineChart,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  {
    title: "Cardoso Calc",
    description: "Calculadora de aluguéis",
    icon: Calculator,
    route: "/calc",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Faturas",
    description: "Gerenciamento de faturas",
    icon: LineChart,
    route: "/temp1",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Cardoso TEMP II",
    description: "Em desenvolvimento",
    icon: Building2,
    route: "/temp2",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Cardoso TEMP III",
    description: "Em desenvolvimento",
    icon: FileSpreadsheet,
    route: "/temp3",
    color: "from-orange-500 to-yellow-500",
  },
] as const;

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">CARDOSO SYS</h1>
          <p className="text-muted-foreground mt-2">
            Selecione um módulo para começar
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {menuItems.map((item) => (
            <Card
              key={item.title}
              className={`p-6 cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-br ${item.color} hover:shadow-lg group`}
              onClick={() => navigate(item.route)}
            >
              <div className="flex items-center gap-4 text-white">
                <item.icon className="w-8 h-8" />
                <div>
                  <h2 className="font-semibold text-xl">{item.title}</h2>
                  <p className="text-white/80">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
