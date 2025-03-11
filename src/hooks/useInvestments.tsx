import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { addMonths } from "date-fns";

type ActiveTab = "investments" | "expenses" | "recurrings";

interface FinancialItem {
  id: number;
  name: string;
  amount: number;
  date: string;
  description: string | null;
  installments?: number;
  created_at: string | null;
  recurring_cancellation_date?: string | null;
}

interface FormData {
  name: string;
  amount: string;
  date: string;
  description: string;
  installments: string;
  is_recurring: boolean;
}

const INITIAL_FORM_STATE = {
  name: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  installments: "1",
  is_recurring: false,
};

export const useInvestments = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<FinancialItem[]>([]);
  const [expenses, setExpenses] = useState<FinancialItem[]>([]);
  const [recurrings, setRecurrings] = useState<FinancialItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelRecurringDialogOpen, setIsCancelRecurringDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FinancialItem | null>(null);
  const [itemToCancelRecurring, setItemToCancelRecurring] = useState<FinancialItem | null>(null);
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
  const [activeTab, setActiveTab] = useState<ActiveTab>("investments");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const investmentsChannel = supabase
      .channel('investments-changes-manage')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'investments' 
      }, () => {
        setRefreshTrigger(prev => prev + 1);
      })
      .subscribe();

    const expensesChannel = supabase
      .channel('expenses-changes-manage')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'expenses' 
      }, () => {
        setRefreshTrigger(prev => prev + 1);
      })
      .subscribe();

    const recurringChannel = supabase
      .channel('recurring-changes-manage')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'recurring' 
      }, () => {
        setRefreshTrigger(prev => prev + 1);
      })
      .subscribe();

    return () => {
      investmentsChannel.unsubscribe();
      expensesChannel.unsubscribe();
      recurringChannel.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: investmentsData, error: investmentsError } = await supabase
        .from("investments")
        .select("*")
        .order("date", { ascending: false });

      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

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

      const yearsInvestments = new Set<number>();
      processedInvestments.forEach((item) => {
        if (item.date) {
          yearsInvestments.add(new Date(item.date).getFullYear());
        }
      });
      setAvailableYearsInvestments(Array.from(yearsInvestments).sort((a, b) => a - b));

      const yearsExpenses = new Set<number>();
      processedExpenses.forEach((item) => {
        if (item.date) {
          yearsExpenses.add(new Date(item.date).getFullYear());
        }
      });
      setAvailableYearsExpenses(Array.from(yearsExpenses).sort((a, b) => a - b));

      const yearsRecurrings = new Set<number>();
      processedRecurring.forEach((item) => {
        if (item.date) {
          yearsRecurrings.add(new Date(item.date).getFullYear());
        }
      });
      setAvailableYearsRecurrings(Array.from(yearsRecurrings).sort((a, b) => a - b));

      setInvestments(processedInvestments);
      setExpenses(processedExpenses);
      setRecurrings(processedRecurring);

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
  }, [refreshTrigger]);

  useEffect(() => {
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
      
      const table = activeTab === "investments" 
        ? "investments" 
        : activeTab === "expenses" 
          ? "expenses" 
          : "recurring";

      if (editingItem) {
        if (activeTab === "recurrings") {
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
        if (activeTab === "recurrings") {
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
              installments: 1,
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

      setIsDialogOpen(false);
      setFormData(INITIAL_FORM_STATE);
      setEditingItem(null);
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
      installments: "installments" in item ? item.installments?.toString() || "1" : "1",
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

      if (activeTab === "recurrings") {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("id", itemToDelete.id);

        if (error) {
          throw error;
        }
      } else {
        const baseName = itemToDelete.name.replace(/\s*\(\d+\/\d+\)$/, "").trim();

        const { data: relatedItems, error: fetchError } = await supabase
          .from(table)
          .select("*")
          .ilike("name", `${baseName}%`);

        if (fetchError) {
          throw fetchError;
        }

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
    } catch (error) {
      console.error("Error in handleConfirmDelete:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o item. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleCancelRecurringClick = (item: FinancialItem) => {
    setItemToCancelRecurring(item);
    setIsCancelRecurringDialogOpen(true);
  };

  const handleConfirmCancelRecurring = async (date: Date) => {
    if (!itemToCancelRecurring) return;

    try {
      const { error } = await supabase
        .from("recurring")
        .update({
          recurring_cancellation_date: date.toISOString().split('T')[0]
        })
        .eq("id", itemToCancelRecurring.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Recorrência cancelada",
        description: "A recorrência foi cancelada com sucesso",
      });

      setIsCancelRecurringDialogOpen(false);
      setItemToCancelRecurring(null);
    } catch (error) {
      console.error("Error in handleConfirmCancelRecurring:", error);
      toast({
        title: "Erro ao cancelar recorrência",
        description: "Ocorreu um erro ao cancelar a recorrência. Tente novamente mais tarde.",
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

  return {
    activeTab,
    setActiveTab,
    investments,
    expenses,
    recurrings,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    formData,
    setFormData,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isCancelRecurringDialogOpen,
    setIsCancelRecurringDialogOpen,
    itemToDelete,
    itemToCancelRecurring,
    editingItem,
    setEditingItem,
    handleSubmit,
    handleEdit,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelRecurringClick,
    handleConfirmCancelRecurring,
    getFilteredItems,
    getAvailableMonths,
    getAvailableYears,
    getButtonLabel,
    getDialogTitle,
    INITIAL_FORM_STATE
  };
};
