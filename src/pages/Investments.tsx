
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters";

interface Investment {
  id: number;
  name: string;
  amount: number;
  date: string;
  description: string | null;
}

const Investments = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const fetchInvestments = async () => {
    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching investments:", error);
      return;
    }

    setInvestments(data);
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("investments")
      .insert([
        {
          name: newInvestment.name,
          amount: Number(newInvestment.amount),
          date: newInvestment.date,
          description: newInvestment.description || null,
        },
      ])
      .select();

    if (error) {
      toast({
        title: "Erro ao adicionar investimento",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Investimento adicionado",
      description: "O investimento foi registrado com sucesso",
    });

    setIsDialogOpen(false);
    setNewInvestment({
      name: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    fetchInvestments();
  };

  const totalInvestment = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os investimentos em equipamentos e infraestrutura
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Investimento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-1 block">
                    Nome
                  </label>
                  <Input
                    id="name"
                    value={newInvestment.name}
                    onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="text-sm font-medium mb-1 block">
                    Valor
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newInvestment.amount}
                    onChange={(e) => setNewInvestment({ ...newInvestment, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="date" className="text-sm font-medium mb-1 block">
                    Data
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={newInvestment.date}
                    onChange={(e) => setNewInvestment({ ...newInvestment, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="text-sm font-medium mb-1 block">
                    Descrição
                  </label>
                  <Input
                    id="description"
                    value={newInvestment.description}
                    onChange={(e) => setNewInvestment({ ...newInvestment, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Adicionar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              R$ {formatCurrency(totalInvestment)}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {investments.map((investment) => (
            <Card key={investment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{investment.name}</CardTitle>
                  <span className="text-lg font-bold">
                    R$ {formatCurrency(investment.amount)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {format(parseISO(investment.date), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
                {investment.description && (
                  <p className="text-sm">{investment.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Investments;
