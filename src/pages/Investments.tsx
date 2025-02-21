import { useEffect, useState } from "react";
import { format, parseISO, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Trash, Edit, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters";
import { Switch } from "@/components/ui/switch";

interface Investment {
  id: number;
  name: string;
  amount: number;
  date: string;
  description: string | null;
  installments: number;
  is_recurring: boolean;
  created_at: string | null;
}

const monthOptions = Array.from({ length: 96 }, (_, i) => i + 1);

const INITIAL_FORM_STATE = {
  name: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  installments: "1",
  is_recurring: false,
};

const Investments = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [expenses, setExpenses] = useState<Investment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExpenseDialog, setIsExpenseDialog] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Investment | null>(null);
  const [editingItem, setEditingItem] = useState<Investment | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [viewMode, setViewMode] = useState<"investments" | "expenses">(
    "investments"
  );

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const fetchData = async () => {
    const { data: investmentsData, error: investmentsError } = await supabase
      .from("investments")
      .select("*")
      .order("date", { ascending: false });

    const { data: expensesData, error: expensesError } = await supabase
      .from("expenses") // Corrigido para "expenses" (se o nome da tabela estiver errado no Supabase, ajuste aqui)
      .select("*")
      .order("date", { ascending: false });

    if (investmentsError || expensesError) {
      console.error("Error fetching data:", investmentsError || expensesError);
      return;
    }

    const processedInvestments = investmentsData || [];
    const processedExpenses = expensesData || [];

    const years = new Set<number>();
    [...processedInvestments, ...processedExpenses].forEach((item) => {
      if (item.date) {
        years.add(new Date(item.date).getFullYear());
      }
    });

    const sortedYears = Array.from(years).sort((a, b) => a - b);
    setAvailableYears(sortedYears);

    let newSelectedYear = selectedYear;
    if (sortedYears.length > 0 && !sortedYears.includes(Number(selectedYear))) {
      newSelectedYear = sortedYears[0].toString();
      setSelectedYear(newSelectedYear);
    }

    setInvestments(processedInvestments);
    setExpenses(processedExpenses);
  };

  useEffect(() => {
    const availableMonths = getAvailableMonths(); // Get available months for selectedYear

    if (!availableMonths.includes(Number(selectedMonth))) {
      setSelectedMonth(availableMonths[0]?.toString() || ""); // Set to first available month
    }
  }, [selectedYear]); // Runs when selectedYear changes

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const table = isExpenseDialog ? "expenses" : "investments";
    const amount = Number(formData.amount);
    const installments = Number(formData.installments);
    const baseDate = new Date(formData.date);

    if (editingItem) {
      const { error } = await supabase
        .from(table)
        .update({
          name: formData.name,
          amount,
          date: formData.date,
          description: formData.description,
          installments: 1,
          is_recurring: formData.is_recurring,
        })
        .eq("id", editingItem.id);

      if (error) {
        toast({
          title: "Erro ao editar registro",
          description: "Tente novamente mais tarde",
          variant: "destructive",
        });
        return;
      }
    } else {
      const installmentAmount = amount / installments;
      const entries = [];

      for (let i = 0; i < installments; i++) {
        const installmentDate = addMonths(baseDate, i);
        entries.push({
          name:
            installments > 1
              ? `${formData.name} (${i + 1}/${installments})`
              : formData.name,
          amount: installmentAmount,
          date: installmentDate.toISOString().split("T")[0],
          description: formData.description,
          installments: 1,
          is_recurring: formData.is_recurring,
        });
      }

      const { error } = await supabase.from(table).insert(entries);

      if (error) {
        toast({
          title: "Erro ao adicionar registro",
          description: "Tente novamente mais tarde",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: `${isExpenseDialog ? "Despesa" : "Investimento"} ${
        editingItem ? "editado" : "adicionado"
      }`,
      description: `${isExpenseDialog ? "A despesa" : "O investimento"} foi ${
        editingItem ? "atualizado" : "registrado"
      } com sucesso`,
    });

    setIsDialogOpen(false);
    setFormData(INITIAL_FORM_STATE);
    setEditingItem(null);
    fetchData();
  };

  const handleEdit = (item: Investment) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      date: item.date,
      description: item.description || "",
      installments: "1",
      is_recurring: item.is_recurring,
    });
    setIsDialogOpen(true);
    setIsExpenseDialog(viewMode === "expenses"); // Define se é uma despesa ou investimento
  };

  const handleDeleteClick = (item: Investment) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const table = viewMode === "expenses" ? "expenses" : "investments";

    // Identifica a base do nome (sem o sufixo da parcela)
    const baseName = itemToDelete.name.replace(/\(\d+\/\d+\)$/, "").trim();

    // Busca todas as parcelas relacionadas
    const { data: relatedItems, error: fetchError } = await supabase
      .from(table)
      .select("*")
      .ilike("name", `${baseName}%`); // Filtra itens com o mesmo nome base

    if (fetchError) {
      toast({
        title: `Erro ao buscar ${
          viewMode === "expenses" ? "despesas" : "investimentos"
        } relacionados`,
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }

    // Extrai os IDs dos itens relacionados
    const idsToDelete = relatedItems.map((item) => item.id);

    // Exclui todos os itens relacionados
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      toast({
        title: `Erro ao excluir ${
          viewMode === "expenses" ? "despesas" : "investimentos"
        }`,
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `${
        viewMode === "expenses" ? "Despesas" : "Investimentos"
      } excluídos`,
      description: `Todas as parcelas de ${
        viewMode === "expenses" ? "a despesa" : "o investimento"
      } foram removidas com sucesso.`,
    });

    setIsDeleteDialogOpen(false);
    setItemToDelete(null);

    // Atualiza os dados após a exclusão
    await fetchData();

    // Recalcula os meses disponíveis após a exclusão
    const items = viewMode === "expenses" ? expenses : investments;
    const availableMonths = getAvailableMonths();

    console.log(availableMonths);
    // Verifica se o mês selecionado ainda está disponível
    if (!availableMonths.includes(Number(selectedMonth))) {
      // Se o mês selecionado não estiver mais disponível, atualiza para o primeiro mês disponível
      if (availableMonths.length > 0) {
        setSelectedMonth(availableMonths[0].toString());
      } else {
        // Se não houver meses disponíveis, define o mês selecionado como vazio
        setSelectedMonth("");
      }
    }
  };

  const handleCancelRecurring = async (item: Investment) => {
    const table = viewMode === "expenses" ? "expenses" : "investments"; // Corrigido para usar viewMode
    const { error } = await supabase
      .from(table)
      .update({ is_recurring: false })
      .eq("id", item.id);

    if (error) {
      toast({
        title: "Erro ao cancelar recorrência",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Recorrência cancelada",
      description: "O registro não será mais recorrente",
    });

    fetchData();
  };

  const getFilteredItems = (items: Investment[]) => {
    return items.filter((item) => {
      const date = new Date(item.date);
      return (
        date.getFullYear().toString() === selectedYear &&
        (date.getMonth() + 1).toString() === selectedMonth
      );
    });
  };

  const getAvailableMonths = () => {
    const items = viewMode === "investments" ? investments : expenses;
    const months = new Set<number>();

    items.forEach((item) => {
      if (item.date) {
        const date = new Date(item.date);
        if (date.getFullYear().toString() === selectedYear) {
          months.add(date.getMonth() + 1);
        }
      }
    });

    return Array.from(months).sort((a, b) => a - b);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Investimentos e Despesas
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os investimentos e despesas em equipamentos, impostos,
              infraestrutura e marketing.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            variant={viewMode === "investments" ? "default" : "outline"}
            onClick={() => setViewMode("investments")}
          >
            Investimentos
          </Button>
          <Button
            variant={viewMode === "expenses" ? "default" : "outline"}
            onClick={() => setViewMode("expenses")}
          >
            Despesas
          </Button>
        </div>

        <div className="mb-8">
          {viewMode === "investments" && (
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setFormData(INITIAL_FORM_STATE);
                  setEditingItem(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setIsExpenseDialog(false);
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Investimento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem
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
                      Valor Total
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
                  {!editingItem && (
                    <div>
                      <label
                        htmlFor="installments"
                        className="text-sm font-medium mb-1 block"
                      >
                        Número de Parcelas
                      </label>
                      <Select
                        value={formData.installments}
                        onValueChange={(value) =>
                          setFormData({ ...formData, installments: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o número de parcelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {month}x de R${" "}
                              {formatCurrency(Number(formData.amount) / month)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="date"
                      className="text-sm font-medium mb-1 block"
                    >
                      {editingItem ? "Data" : "Data da Primeira Parcela"}
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
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring"
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_recurring: checked })
                      }
                    />
                    <label htmlFor="recurring" className="text-sm font-medium">
                      Pagamento Recorrente Mensal
                    </label>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingItem ? "Salvar" : "Adicionar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {viewMode === "expenses" && (
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setFormData(INITIAL_FORM_STATE);
                  setEditingItem(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setIsExpenseDialog(true);
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Editar Despesa" : "Adicionar Despesa"}
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
                      Valor Total
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
                  {!editingItem && (
                    <div>
                      <label
                        htmlFor="installments"
                        className="text-sm font-medium mb-1 block"
                      >
                        Número de Parcelas
                      </label>
                      <Select
                        value={formData.installments}
                        onValueChange={(value) =>
                          setFormData({ ...formData, installments: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o número de parcelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {month}x de R${" "}
                              {formatCurrency(Number(formData.amount) / month)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="date"
                      className="text-sm font-medium mb-1 block"
                    >
                      {editingItem ? "Data" : "Data da Primeira Parcela"}
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
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring"
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_recurring: checked })
                      }
                    />
                    <label htmlFor="recurring" className="text-sm font-medium">
                      Pagamento Recorrente Mensal
                    </label>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingItem ? "Salvar" : "Adicionar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="mb-8">
          {/* Exibe os dropdowns apenas se houver itens */}
          {((investments.length > 0 && viewMode === "investments") ||
            (expenses.length > 0 && viewMode === "expenses")) && (
            <div className="flex gap-4 mb-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMonths().map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {format(new Date(2024, month - 1), "MMMM", {
                        locale: ptBR,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4">
            <h2 className="text-xl font-semibold mb-4">
              {viewMode === "expenses" ? "Despesas" : "Investimentos"} do
              Período
            </h2>
            {/* Exibe uma mensagem se não houver itens */}
            {((investments.length === 0 && viewMode === "investments") ||
              (expenses.length === 0 && viewMode === "expenses")) && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {viewMode === "expenses" ? "Nenhuma" : "Nenhum"}{" "}
                  {viewMode === "expenses" ? "despesa" : "investimento"}{" "}
                  {viewMode === "expenses" ? "encontrada" : "encontrado"}{" "}
                </p>
              </div>
            )}
          </div>
          {getFilteredItems(
            viewMode === "expenses" ? expenses : investments
          ).map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>{item.name}</CardTitle>
                    {item.is_recurring && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCancelRecurring(item)}
                        title="Cancelar Recorrência"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      R$ {formatCurrency(item.amount)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {format(parseISO(item.date), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
                {item.description && (
                  <p className="text-sm">{item.description}</p>
                )}
                {item.is_recurring && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Pagamento recorrente mensal
                  </p>
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
                Tem certeza que deseja excluir{" "}
                {viewMode === "expenses" ? "a despesa" : "o investimento"}{" "}
                {itemToDelete?.name}? Esta ação não pode ser desfeita.
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
