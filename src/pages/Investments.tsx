
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
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";
import { Plus, Trash, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters";
import { Switch } from "@/components/ui/switch";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { DeleteRecurringDialog } from "@/components/investments/DeleteRecurringDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 

interface Investment {
  id: number;
  name: string;
  amount: number;
  date: string;
  description: string | null;
  installments: number;
  created_at: string | null;
}

interface Expense {
  id: number;
  name: string;
  amount: number;
  date: string;
  description: string | null;
  installments: number;
  created_at: string | null;
}

interface Recurring {
  id: number;
  name: string;
  amount: number;
  date: string;
  description: string | null;
  created_at: string | null;
}

type FinancialItem = Investment | Expense | Recurring;

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recurrings, setRecurrings] = useState<Recurring[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FinancialItem | null>(null);
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);
  const [availableYearsInvestments, setAvailableYearsInvestments] = useState<number[]>([]);
  const [availableYearsExpenses, setAvailableYearsExpenses] = useState<number[]>([]);
  const [availableYearsRecurrings, setAvailableYearsRecurrings] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [activeTab, setActiveTab] = useState<"investments" | "expenses" | "recurrings">("investments");
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const fetchData = async () => {
    try {
      // Fetch investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from("investments")
        .select("*")
        .order("date", { ascending: false });

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      // Fetch recurring items
      const { data: recurringData, error: recurringError } = await supabase
        .from("recurring")
        .select("*")
        .order("date", { ascending: false });

      if (investmentsError) {
        console.error("Error fetching investments:", investmentsError);
      }

      if (expensesError) {
        console.error("Error fetching expenses:", expensesError);
      }

      if (recurringError) {
        console.error("Error fetching recurring items:", recurringError);
      }

      const processedInvestments = investmentsData || [];
      const processedExpenses = expensesData || [];
      const processedRecurring = recurringData || [];

      // Calculate available years for investments
      const yearsInvestments = new Set<number>();
      processedInvestments.forEach((item) => {
        if (item.date) {
          yearsInvestments.add(new Date(item.date).getFullYear());
        }
      });
      setAvailableYearsInvestments(Array.from(yearsInvestments).sort((a, b) => a - b));

      // Calculate available years for expenses
      const yearsExpenses = new Set<number>();
      processedExpenses.forEach((item) => {
        if (item.date) {
          yearsExpenses.add(new Date(item.date).getFullYear());
        }
      });
      setAvailableYearsExpenses(Array.from(yearsExpenses).sort((a, b) => a - b));

      // Calculate available years for recurring
      const yearsRecurrings = new Set<number>();
      processedRecurring.forEach((item) => {
        if (item.date) {
          yearsRecurrings.add(new Date(item.date).getFullYear());
        }
      });
      setAvailableYearsRecurrings(Array.from(yearsRecurrings).sort((a, b) => a - b));

      // Update state with fetched data
      setInvestments(processedInvestments);
      setExpenses(processedExpenses);
      setRecurrings(processedRecurring);

      // Set default year if none is selected
      const currentYear = new Date().getFullYear();
      if (!selectedYear) {
        setSelectedYear(currentYear.toString());
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
      toast({
        title: "Erro ao buscar dados",
        description: "Ocorreu um erro ao buscar os dados. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Update selected month when year changes to ensure it's valid
    const availableMonths = getAvailableMonths();
    if (availableMonths.length > 0 && !availableMonths.includes(Number(selectedMonth))) {
      setSelectedMonth(availableMonths[0].toString());
    }
  }, [selectedYear, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const amount = Number(formData.amount);
      const installments = Number(formData.installments);
      const baseDate = new Date(formData.date);
      
      // Determine which table to use based on active tab
      const table = activeTab === "investments" 
        ? "investments" 
        : activeTab === "expenses" 
          ? "expenses" 
          : "recurring";

      // Handle editing
      if (editingItem) {
        if (activeTab === "recurring") {
          // Update recurring item
          const { error } = await supabase
            .from("recurring")
            .update({
              name: formData.name,
              amount,
              date: formData.date,
              description: formData.description,
            })
            .eq("id", editingItem.id);

          if (error) {
            throw error;
          }
        } else {
          // Update investments or expenses
          const { error } = await supabase
            .from(table)
            .update({
              name: formData.name,
              amount,
              date: formData.date,
              description: formData.description,
              installments: installments,
            })
            .eq("id", editingItem.id);

          if (error) {
            throw error;
          }
        }

        toast({
          title: `${activeTab === "expenses" ? "Despesa" : activeTab === "investments" ? "Investimento" : "Gasto recorrente"} editado`,
          description: `${activeTab === "expenses" ? "A despesa" : activeTab === "investments" ? "O investimento" : "O gasto recorrente"} foi atualizado com sucesso`,
        });
      } else {
        // Handle new item
        if (activeTab === "recurring") {
          // Add recurring item - no installments
          const { error } = await supabase
            .from("recurring")
            .insert([{
              name: formData.name,
              amount,
              date: baseDate.toISOString().split("T")[0],
              description: formData.description,
            }]);

          if (error) {
            throw error;
          }
        } else {
          // Add investments or expenses with installments
          const entries = [];

          for (let i = 0; i < installments; i++) {
            const installmentDate = addMonths(baseDate, i);
            entries.push({
              name: installments > 1
                ? `${formData.name} (${i + 1}/${installments})`
                : formData.name,
              amount: installments > 1 ? amount / installments : amount,
              date: installmentDate.toISOString().split("T")[0],
              description: formData.description,
              installments: 1, // Each entry is marked as one installment
            });
          }

          const { error } = await supabase.from(table).insert(entries);

          if (error) {
            throw error;
          }
        }

        toast({
          title: `${activeTab === "expenses" ? "Despesa" : activeTab === "investments" ? "Investimento" : "Gasto recorrente"} adicionado`,
          description: `${activeTab === "expenses" ? "A despesa" : activeTab === "investments" ? "O investimento" : "O gasto recorrente"} foi registrado com sucesso`,
        });
      }

      // Reset form and refresh data
      setIsDialogOpen(false);
      setFormData(INITIAL_FORM_STATE);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: FinancialItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      date: item.date,
      description: item.description || "",
      installments: "installments" in item ? item.installments.toString() : "1",
      is_recurring: false,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: FinancialItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const table = activeTab === "investments" 
        ? "investments" 
        : activeTab === "expenses" 
          ? "expenses" 
          : "recurring";

      if (activeTab === "recurring") {
        // Simple delete for recurring items
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("id", itemToDelete.id);

        if (error) {
          throw error;
        }
      } else {
        // For investments and expenses, check for installments
        const baseName = itemToDelete.name.replace(/\s*\(\d+\/\d+\)$/, "").trim();

        // Find related installments
        const { data: relatedItems, error: fetchError } = await supabase
          .from(table)
          .select("*")
          .ilike("name", `${baseName}%`);

        if (fetchError) {
          throw fetchError;
        }

        // Delete all related installments
        if (relatedItems && relatedItems.length > 0) {
          const idsToDelete = relatedItems.map(item => item.id);
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .in("id", idsToDelete);

          if (deleteError) {
            throw deleteError;
          }
        }
      }

      toast({
        title: `${activeTab === "expenses" ? "Despesa" : activeTab === "investments" ? "Investimento" : "Gasto recorrente"} excluído`,
        description: `${activeTab === "expenses" ? "A despesa" : activeTab === "investments" ? "O investimento" : "O gasto recorrente"} foi removido com sucesso`,
      });

      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Error in handleConfirmDelete:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o item. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const getFilteredItems = () => {
    let items: FinancialItem[] = [];
    
    if (activeTab === "investments") {
      items = investments;
    } else if (activeTab === "expenses") {
      items = expenses;
    } else {
      items = recurrings;
    }
    
    return items.filter(item => {
      const date = new Date(item.date);
      return (
        date.getFullYear().toString() === selectedYear &&
        (date.getMonth() + 1).toString() === selectedMonth
      );
    });
  };

  const getAvailableMonths = () => {
    let items: FinancialItem[] = [];
    
    if (activeTab === "investments") {
      items = investments;
    } else if (activeTab === "expenses") {
      items = expenses;
    } else {
      items = recurrings;
    }

    const months = new Set<number>();

    items.forEach(item => {
      if (item.date) {
        const date = new Date(item.date);
        if (date.getFullYear().toString() === selectedYear) {
          months.add(date.getMonth() + 1);
        }
      }
    });

    return Array.from(months).sort((a, b) => a - b);
  };

  const getAvailableYears = () => {
    if (activeTab === "investments") {
      return availableYearsInvestments;
    } else if (activeTab === "expenses") {
      return availableYearsExpenses;
    } else {
      return availableYearsRecurrings;
    }
  };

  const getButtonLabel = () => {
    if (activeTab === "investments") {
      return "Novo Investimento";
    } else if (activeTab === "expenses") {
      return "Nova Despesa";
    } else {
      return "Novo Gasto Recorrente";
    }
  };

  const getDialogTitle = () => {
    const action = editingItem ? "Editar" : "Adicionar";
    if (activeTab === "investments") {
      return `${action} Investimento`;
    } else if (activeTab === "expenses") {
      return `${action} Despesa`;
    } else {
      return `${action} Gasto Recorrente`;
    }
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
              Gerencie os investimentos, despesas e gastos recorrentes em equipamentos, impostos,
              infraestrutura e marketing.
            </p>
          </div>
        </div>

        <Tabs 
          defaultValue="investments" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "investments" | "expenses" | "recurrings")}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="investments">Investimentos</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="recurrings">Recorrentes</TabsTrigger>
          </TabsList>

          <TabsContent value="investments" className="mt-4">
            <div className="mb-8">
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
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {getButtonLabel()}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
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
                    
                    {activeTab !== "recurrings" && (
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
                                {formatCurrency(
                                  formData.amount 
                                    ? Number(formData.amount) / month 
                                    : 0
                                )}
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
                        {editingItem ? "Data" : activeTab === "recurrings" ? "Data Inicial" : "Data da Primeira Parcela"}
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
                    
                    <Button type="submit" className="w-full">
                      {editingItem ? "Salvar" : "Adicionar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="mt-4">
            <div className="mb-8">
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
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {getButtonLabel()}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Same form fields as investments */}
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
                              {formatCurrency(
                                formData.amount 
                                  ? Number(formData.amount) / month 
                                  : 0
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                    
                    <Button type="submit" className="w-full">
                      {editingItem ? "Salvar" : "Adicionar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="recurrings" className="mt-4">
            <div className="mb-8">
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
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {getButtonLabel()}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Simplified form for recurring expenses - no installments */}
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
                        Valor Mensal
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
                        Data Inicial
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
                    
                    <Button type="submit" className="w-full">
                      {editingItem ? "Salvar" : "Adicionar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>

        {/* Year/Month filters */}
        <div className="mb-8">
          {(getAvailableYears().length > 0) && (
            <div className="flex gap-4 mb-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableYears().map((year) => (
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
              {activeTab === "investments" 
                ? "Investimentos" 
                : activeTab === "expenses" 
                  ? "Despesas" 
                  : "Gastos Recorrentes"} do Período
            </h2>

            {/* Display when no items are found */}
            {getFilteredItems().length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {activeTab === "investments" 
                    ? "Nenhum investimento encontrado" 
                    : activeTab === "expenses" 
                      ? "Nenhuma despesa encontrada" 
                      : "Nenhum gasto recorrente encontrado"}
                </p>
              </div>
            )}

            {/* List items */}
            {getFilteredItems().map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{item.name}</CardTitle>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Delete dialog for investments/expenses */}
        {activeTab !== "recurrings" && (
          <DeleteProductDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            productName={itemToDelete?.name || ""}
          />
        )}

        {/* Delete dialog for recurring items */}
        {activeTab === "recurrings" && (
          <DeleteRecurringDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            itemName={itemToDelete?.name || ""}
          />
        )}
      </div>
    </div>
  );
};

export default Investments;
