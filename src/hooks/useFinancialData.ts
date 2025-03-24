
import { useState, useEffect } from "react";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type InvestmentRow = Database["public"]["Tables"]["investments"]["Row"];
type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type RecurringRow = Database["public"]["Tables"]["recurring"]["Row"];

export interface MonthData {
  month: number;
  year: number;
  label: string;
  count: number;
  totalInvoices: number;
  totalInvestments: number;
  totalExpenses: number;
  totalRecurring: number;
  balance: number;
}

export const useFinancialData = () => {
  const [years, setYears] = useState<number[]>([]);
  const [monthsByYear, setMonthsByYear] = useState<Record<number, MonthData[]>>({});
  const [filteredMonths, setFilteredMonths] = useState<MonthData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar faturas
        const { data: invoices, error: invoicesError } = await supabase
          .from("invoices")
          .select("*")
          .order("invoice_date", { ascending: true });

        // Buscar investimentos
        const { data: investments, error: investmentsError } = await supabase
          .from("investments")
          .select("*")
          .order("date", { ascending: true });

        // Buscar despesas
        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select("*")
          .order("date", { ascending: true });

        // Buscar gastos recorrentes
        const { data: recurrings, error: recurringsError } = await supabase
          .from("recurring")
          .select("*")
          .order("date", { ascending: true });

        if (invoicesError || investmentsError || expensesError || recurringsError) {
          console.error("Erro ao buscar dados:", {
            invoicesError,
            investmentsError,
            expensesError,
            recurringsError,
          });
          return;
        }

        // Processar os dados
        const monthsData: Record<number, Record<number, MonthData>> = {};
        const yearsSet = new Set<number>();

        // Processar faturas
        invoices.forEach((invoice: InvoiceRow) => {
          const date = parseISO(invoice.invoice_date);
          const year = date.getFullYear();
          const month = date.getMonth();

          yearsSet.add(year);

          if (!monthsData[year]) {
            monthsData[year] = {};
          }

          if (!monthsData[year][month]) {
            monthsData[year][month] = {
              month,
              year,
              label: format(date, "MMMM", { locale: ptBR }),
              count: 0,
              totalInvoices: 0,
              totalInvestments: 0,
              totalExpenses: 0,
              totalRecurring: 0,
              balance: 0,
            };
          }

          monthsData[year][month].count++;
          monthsData[year][month].totalInvoices += invoice.total || 0;
        });

        // Processar investimentos
        investments.forEach((investment: InvestmentRow) => {
          const date = parseISO(investment.date);
          const year = date.getFullYear();
          const month = date.getMonth();

          yearsSet.add(year);

          if (!monthsData[year]) {
            monthsData[year] = {};
          }

          if (!monthsData[year][month]) {
            monthsData[year][month] = {
              month,
              year,
              label: format(date, "MMMM", { locale: ptBR }),
              count: 0,
              totalInvoices: 0,
              totalInvestments: 0,
              totalExpenses: 0,
              totalRecurring: 0,
              balance: 0,
            };
          }

          if (monthsData[year]?.[month]) {
            monthsData[year][month].totalInvestments += investment.amount || 0;
          }
        });

        // Processar despesas
        expenses.forEach((expense: ExpenseRow) => {
          const date = parseISO(expense.date);
          const year = date.getFullYear();
          const month = date.getMonth();

          yearsSet.add(year);

          if (!monthsData[year]) {
            monthsData[year] = {};
          }

          if (!monthsData[year][month]) {
            monthsData[year][month] = {
              month,
              year,
              label: format(date, "MMMM", { locale: ptBR }),
              count: 0,
              totalInvoices: 0,
              totalInvestments: 0,
              totalExpenses: 0,
              totalRecurring: 0,
              balance: 0,
            };
          }

          if (monthsData[year]?.[month]) {
            monthsData[year][month].totalExpenses += expense.amount || 0;
          }
        });

        // Processar gastos recorrentes
        recurrings?.forEach((recurring: RecurringRow) => {
          const date = parseISO(recurring.date);
          const year = date.getFullYear();
          const month = date.getMonth();

          yearsSet.add(year);

          if (!monthsData[year]) {
            monthsData[year] = {};
          }

          if (!monthsData[year][month]) {
            monthsData[year][month] = {
              month,
              year,
              label: format(date, "MMMM", { locale: ptBR }),
              count: 0,
              totalInvoices: 0,
              totalInvestments: 0,
              totalExpenses: 0,
              totalRecurring: 0,
              balance: 0,
            };
          }

          if (monthsData[year]?.[month]) {
            monthsData[year][month].totalRecurring += recurring.amount || 0;
          }
        });

        // Calcular o saldo financeiro
        Object.keys(monthsData).forEach((year) => {
          Object.keys(monthsData[Number(year)]).forEach((month) => {
            const monthData = monthsData[Number(year)][Number(month)];
            monthData.balance =
              monthData.totalInvoices -
              monthData.totalInvestments -
              monthData.totalExpenses -
              monthData.totalRecurring;
          });
        });

        // Organizar os dados para o estado
        const processedYears = Array.from(yearsSet).sort((a, b) => a - b);
        const processedMonths: Record<number, MonthData[]> = {};

        processedYears.forEach((year) => {
          processedMonths[year] = Object.values(monthsData[year]).sort(
            (a, b) => a.month - b.month
          );
        });

        setYears(processedYears);
        setMonthsByYear(processedMonths);
        if (processedYears.length > 0) {
          setSelectedYear(processedYears[processedYears.length - 1]);
        }
      } catch (error) {
        console.error("Erro na busca de dados financeiros:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar meses com base no intervalo de datas selecionado
  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      // Se não houver intervalo de datas, mostrar apenas o ano selecionado
      setFilteredMonths(monthsByYear[selectedYear] || []);
      return;
    }

    // Criar um array com todos os meses de todos os anos
    const allMonths: MonthData[] = [];
    years.forEach(year => {
      if (monthsByYear[year]) {
        allMonths.push(...monthsByYear[year]);
      }
    });

    // Filtrar os meses que estão dentro do intervalo de datas
    const filtered = allMonths.filter(monthData => {
      const monthStart = startOfMonth(new Date(monthData.year, monthData.month));
      const monthEnd = endOfMonth(new Date(monthData.year, monthData.month));
      
      // Verificar se há interseção entre o intervalo de meses e o intervalo de datas selecionado
      return (
        (startDate <= monthEnd && endDate >= monthStart) ||
        isWithinInterval(monthStart, { start: startDate, end: endDate }) ||
        isWithinInterval(monthEnd, { start: startDate, end: endDate })
      );
    });

    // Ordenar os meses por data
    filtered.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    setFilteredMonths(filtered);
  };

  // Aplicar o filtro quando as datas ou o ano selecionado mudar
  useEffect(() => {
    applyDateFilter();
  }, [startDate, endDate, selectedYear, monthsByYear]);

  return { 
    years, 
    monthsByYear, 
    filteredMonths,
    selectedYear, 
    setSelectedYear, 
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    applyDateFilter,
    isLoading 
  };
};
