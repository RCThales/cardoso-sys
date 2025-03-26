import { useState, useEffect } from "react";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  endOfDay,
} from "date-fns";
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
  const [monthsByYear, setMonthsByYear] = useState<Record<number, MonthData[]>>(
    {}
  );
  const [filteredMonths, setFilteredMonths] = useState<MonthData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
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

        if (
          invoicesError ||
          investmentsError ||
          expensesError ||
          recurringsError
        ) {
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
  const applyDateFilter = async () => {
    if (!startDate || !endDate) {
      // Se não houver intervalo de datas, mostrar apenas o ano selecionado
      setFilteredMonths(monthsByYear[selectedYear] || []);
      return;
    }

    setIsLoading(true);

    try {
      // Ensure start date is at the beginning of the day (00:00:00)
      const startOfDayDate = startOfDay(startDate);

      // Ensure end date is at the end of the day (23:59:59)
      const endOfDayDate = endOfDay(endDate);

      // Criar array de meses filtrados
      const filtered: MonthData[] = [];

      // Para cada mês entre a data inicial e final (inclusive)
      for (
        let year = startOfDayDate.getFullYear();
        year <= endOfDayDate.getFullYear();
        year++
      ) {
        // Determinar o mês inicial e final para este ano
        const firstMonth =
          year === startOfDayDate.getFullYear() ? startOfDayDate.getMonth() : 0;
        const lastMonth =
          year === endOfDayDate.getFullYear() ? endOfDayDate.getMonth() : 11;

        for (let month = firstMonth; month <= lastMonth; month++) {
          // Verificar se temos dados para este mês e ano
          if (monthsByYear[year]?.some((m) => m.month === month)) {
            try {
              // Formatar datas para filtro no Supabase - use the exact day boundaries
              const monthStart = new Date(year, month, 1);
              const monthEnd = endOfMonth(monthStart);

              // Dias exatos que devemos considerar (respeitando startDate e endDate)
              const effectiveStartDate = new Date(
                Math.max(monthStart.getTime(), startOfDayDate.getTime())
              );

              const effectiveEndDate = new Date(
                Math.min(monthEnd.getTime(), endOfDayDate.getTime())
              );

              const startDateStr = effectiveStartDate.toISOString();
              const endDateStr = effectiveEndDate.toISOString();

              // Buscar dados filtrados pelas datas exatas para cada categoria
              const { data: filteredInvoices } = await supabase
                .from("invoices")
                .select("*")
                .gte("invoice_date", startDateStr)
                .lte("invoice_date", endDateStr);

              const { data: filteredInvestments } = await supabase
                .from("investments")
                .select("*")
                .gte("date", startDateStr)
                .lte("date", endDateStr);

              const { data: filteredExpenses } = await supabase
                .from("expenses")
                .select("*")
                .gte("date", startDateStr)
                .lte("date", endDateStr);

              const { data: filteredRecurring } = await supabase
                .from("recurring")
                .select("*")
                .gte("date", startDateStr)
                .lte("date", endDateStr);

              // Calcular totais
              const totalInvoices =
                filteredInvoices?.reduce(
                  (sum, inv) => sum + Number(inv.total),
                  0
                ) || 0;
              const totalInvestments =
                filteredInvestments?.reduce(
                  (sum, inv) => sum + Number(inv.amount),
                  0
                ) || 0;
              const totalExpenses =
                filteredExpenses?.reduce(
                  (sum, exp) => sum + Number(exp.amount),
                  0
                ) || 0;
              const totalRecurring =
                filteredRecurring?.reduce(
                  (sum, rec) => sum + Number(rec.amount),
                  0
                ) || 0;

              // Somente adicionar meses que têm pelo menos algum registro no período
              if (
                filteredInvoices?.length ||
                filteredInvestments?.length ||
                filteredExpenses?.length ||
                filteredRecurring?.length
              ) {
                // Encontrar o modelo base deste mês ou criar um novo
                const baseMonth = monthsByYear[year]?.find(
                  (m) => m.month === month
                ) || {
                  month,
                  year,
                  label: format(new Date(year, month), "MMMM", {
                    locale: ptBR,
                  }),
                  count: 0,
                  totalInvoices: 0,
                  totalExpenses: 0,
                  totalInvestments: 0,
                  totalRecurring: 0,
                  balance: 0,
                };

                // Criar um novo objeto de mês com os dados filtrados
                const filteredMonth: MonthData = {
                  ...baseMonth,
                  totalInvoices,
                  totalInvestments,
                  totalExpenses,
                  totalRecurring,
                  balance:
                    totalInvoices -
                    totalExpenses -
                    totalInvestments -
                    totalRecurring,
                };

                filtered.push(filteredMonth);
              }
            } catch (error) {
              console.error(
                "Erro ao filtrar dados para o mês:",
                year,
                month,
                error
              );
            }
          }
        }
      }

      // Ordenar os meses por data
      filtered.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      setFilteredMonths(filtered);
    } catch (error) {
      console.error("Erro ao aplicar filtro de datas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar o filtro quando as datas ou o ano selecionado mudar
  useEffect(() => {
    if (startDate && endDate) {
      applyDateFilter();
    } else {
      setFilteredMonths(monthsByYear[selectedYear] || []);
    }
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
    isLoading,
  };
};
