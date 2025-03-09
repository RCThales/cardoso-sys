
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
  const [activeTab, setActiveTab] = useState<ActiveTab>("investments");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);

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
        if (activeTab === "recurrings") {
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
        if (activeTab === "recurrings") {
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
    itemToDelete,
    editingItem,
    handleSubmit,
    handleEdit,
    handleDeleteClick,
    handleConfirmDelete,
    getFilteredItems,
    getAvailableMonths,
    getAvailableYears,
    getButtonLabel,
    getDialogTitle,
    INITIAL_FORM_STATE
  };
};
