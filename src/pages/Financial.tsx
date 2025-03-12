import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Download } from "lucide-react";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type InvestmentRow = Database["public"]["Tables"]["investments"]["Row"];
type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];

interface MonthData {
  month: number;
  year: number;
  label: string;
  count: number;
  totalInvoices: number;
  totalInvestments: number;
  totalExpenses: number;
  balance: number; // Saldo financeiro (invoices - investments - expenses)
}

const Financial = () => {
  const navigate = useNavigate();
  const [years, setYears] = useState<number[]>([]);
  const [monthsByYear, setMonthsByYear] = useState<Record<number, MonthData[]>>(
    {}
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    const fetchData = async () => {
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

      if (invoicesError || investmentsError || expensesError) {
        console.error("Erro ao buscar dados:", {
          invoicesError,
          investmentsError,
          expensesError,
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
            balance: 0,
          };
        }

        if (monthsData[year]?.[month]) {
          monthsData[year][month].totalExpenses += expense.amount || 0;
        }
      });

      // Calcular o saldo financeiro
      Object.keys(monthsData).forEach((year) => {
        Object.keys(monthsData[year]).forEach((month) => {
          const monthData = monthsData[year][month];
          monthData.balance =
            monthData.totalInvoices -
            monthData.totalInvestments -
            monthData.totalExpenses;
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
        setSelectedYear(processedYears[0]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Análise Financeira
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize os resultados financeiros por mês e ano
          </p>
        </div>

        {/* Dropdown para selecionar o ano */}
        <div className="flex mb-8">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Botão para baixar o relatório anual 
          <Button
            variant="outline"
            // onClick={handleDownloadPDF}
            className="w-fit ml-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Relatório Anual
          </Button>
          */}
        </div>

        {/* Exibir os meses do ano selecionado */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {monthsByYear[selectedYear]?.map((month) => (
            <Button
              key={`${selectedYear}-${month.month}`}
              variant="outline"
              className="h-auto py-8 flex flex-col gap-2"
              onClick={() =>
                navigate(`/financial/${selectedYear}/${month.month + 1}`)
              }
            >
              <span className="text-lg font-semibold capitalize">
                {month.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {month.count} faturas
              </span>
              <span className="text-sm text-muted-foreground">
                Saldo:{" "}
                {month.balance.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Financial;
