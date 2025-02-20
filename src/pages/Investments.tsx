import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";
import { Plus, Trash, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters";

interface Investment {
  id: number;
  name: string;
  amount: number;
  date: string;
  description: string | null;
}

interface Expense {
  id: number;
  name: string;
  amount: number;
  date: string;
  description: string | null;
}

const Investments = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] =
    useState<Investment | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(
    null
  );
  const [formData, setFormData] = useState({
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

    const investmentData = {
      name: formData.name,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description || null,
    };

    const { error } = editingInvestment
      ? await supabase
          .from("investments")
          .update(investmentData)
          .eq("id", editingInvestment.id)
      : await supabase.from("investments").insert([investmentData]);

    if (error) {
      toast({
        title: `Erro ao ${
          editingInvestment ? "editar" : "adicionar"
        } investimento`,
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `Investimento ${editingInvestment ? "editado" : "adicionado"}`,
      description: `O investimento foi ${
        editingInvestment ? "atualizado" : "registrado"
      } com sucesso`,
    });

    setIsDialogOpen(false);
    setFormData({
      name: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setEditingInvestment(null);
    fetchInvestments();
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      amount: investment.amount.toString(),
      date: investment.date,
      description: investment.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (investment: Investment) => {
    setInvestmentToDelete(investment);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!investmentToDelete) return;

    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", investmentToDelete.id);

    if (error) {
      toast({
        title: "Erro ao excluir investimento",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Investimento excluído",
      description: "O investimento foi removido com sucesso",
    });

    setIsDeleteDialogOpen(false);
    setInvestmentToDelete(null);
    fetchInvestments();
  };

  const totalInvestment = investments.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os gastos em equipamentos, impostos, infraestrutura e
              marketing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingInvestment
                    ? "Editar Investimento"
                    : "Adicionar Investimento"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-medium mb-1 block"
                  >
                    Nome
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium mb-1 block"
                  >
                    Valor
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="text-sm font-medium mb-1 block"
                  >
                    Data
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="text-sm font-medium mb-1 block"
                  >
                    Descrição
                  </label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingInvestment ? "Salvar" : "Adicionar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingInvestment ? "Editar Despesa" : "Adicionar Despesa"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-medium mb-1 block"
                  >
                    Nome
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium mb-1 block"
                  >
                    Valor
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="text-sm font-medium mb-1 block"
                  >
                    Data
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="text-sm font-medium mb-1 block"
                  >
                    Descrição
                  </label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingInvestment ? "Salvar" : "Adicionar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Total de Investimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                R$ {formatCurrency(totalInvestment)}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Total de Despesa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                R$ {formatCurrency(totalExpenses)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {investments.map((investment) => (
            <Card key={investment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{investment.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      R$ {formatCurrency(investment.amount)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(investment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(investment)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
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

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o investimento{" "}
                {investmentToDelete?.name}? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Investments;
