import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Navbar } from "@/components/Navbar";
import { DollarSign, TrendingDown, TrendingUp, LineChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { FinancialCard } from "@/components/financial/FinancialCard";
import { FinancialHeader } from "@/components/financial/FinancialHeader";
import { Separator } from "@radix-ui/react-select";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

interface FinancialSummary {
  grossIncome: number;
  netProfit: number;
  totalExpenses: number;
  totalInvestment: number;
  invoiceCount: number;
  averageTicket: number;
}

const FinancialDetails = () => {
  const { year, month } = useParams();
  const [summary, setSummary] = useState<FinancialSummary>({
    grossIncome: 0,
    netProfit: 0,
    totalExpenses: 0,
    totalInvestment: 0,
    invoiceCount: 0,
    averageTicket: 0,
  });
  const [previousSummary, setPreviousSummary] =
    useState<FinancialSummary | null>(null);
  const [investmentDetails, setInvestmentDetails] = useState<
    Array<{ name: string; amount: number }>
  >([]);
  const [expenseDetails, setExpenseDetails] = useState<
    Array<{ name: string; amount: number }>
  >([]);

  const monthName = month
    ? format(
        new Date(parseInt(year || ""), parseInt(month) - 1, 1),
        "MMMM 'de' yyyy",
        { locale: ptBR }
      )
    : "";

  const getInvestmentDetails = (
    investments: Array<{ name: string; amount: number }>
  ) => {
    return investments.map((inv) => ({
      description: inv.name,
      amount: Number(inv.amount),
    }));
  };

  const getExpenseDetails = (
    expenses: Array<{ name: string; amount: number }>
  ) => {
    return expenses.map((exp) => ({
      description: exp.name,
      amount: Number(exp.amount),
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!year || !month) return;

      const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const previousDate = subMonths(currentDate, 1);

      const { data: investments } = await supabase
        .from("investments")
        .select("*")
        .order("date", { ascending: false });

      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      const { data: currentInvoices } = await supabase
        .from("invoices")
        .select("*")
        .gte("invoice_date", currentDate.toISOString())
        .lte(
          "invoice_date",
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).toISOString()
        );

      const { data: previousInvoices } = await supabase
        .from("invoices")
        .select("*")
        .gte("invoice_date", previousDate.toISOString())
        .lte(
          "invoice_date",
          new Date(
            previousDate.getFullYear(),
            previousDate.getMonth() + 1,
            0
          ).toISOString()
        );

      const currentGrossIncome =
        currentInvoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      const previousGrossIncome =
        previousInvoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      0.2;

      const previousExpenses = previousGrossIncome * 0.2;

      const totalInvestment =
        investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

      console.log("Total Investmente: " + investments);
      const totalExpenses =
        expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      console.log("Total Expenses: " + expenses);

      const currentSummary = {
        grossIncome: currentGrossIncome,
        netProfit: currentGrossIncome - totalExpenses - totalInvestment,
        totalExpenses,
        totalInvestment,
        invoiceCount: currentInvoices?.length || 0,
        averageTicket: currentInvoices?.length
          ? currentGrossIncome / currentInvoices.length
          : 0,
      };

      // Só define previousSummary se houver dados do mês anterior
      setPreviousSummary(
        previousInvoices && previousInvoices.length > 0
          ? {
              grossIncome: previousGrossIncome,
              netProfit:
                previousGrossIncome - previousExpenses - totalInvestment,
              totalExpenses,
              totalInvestment,
              invoiceCount: previousInvoices.length,
              averageTicket: previousInvoices.length
                ? previousGrossIncome / previousInvoices.length
                : 0,
            }
          : null
      );

      setSummary(currentSummary);
      setInvestmentDetails(investments || []);
    };

    fetchData();
  }, [year, month]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <FinancialHeader
          monthName={monthName}
          summary={summary}
          expenseDetails={getExpenseDetails(expenseDetails)}
          investmentDetails={getInvestmentDetails(investmentDetails)}
        />
        <div className="pb-3 font-medium text-lg">Faturamento</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FinancialCard
            title="Receita Bruta"
            value={summary.grossIncome}
            previousValue={previousSummary?.grossIncome}
            description={`${summary.invoiceCount} faturas no período`}
            icon={DollarSign}
            iconColor="text-green-500"
          />
          <FinancialCard
            title="Lucro Líquido"
            value={summary.netProfit}
            previousValue={previousSummary?.netProfit}
            description="Após despesas e investimentos"
            icon={TrendingUp}
            iconColor="text-emerald-500"
          />
          <FinancialCard
            title="Ticket Médio"
            value={summary.averageTicket}
            previousValue={previousSummary?.averageTicket}
            description="Valor médio por fatura"
            icon={DollarSign}
            iconColor="text-purple-500"
          />
        </div>
        <div className="pb-3 font-medium text-lg mt-6">Gastos</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FinancialCard
            title="Despesas"
            value={summary.totalExpenses}
            previousValue={previousSummary?.totalExpenses}
            description="Impostos e manutenção de equipamentos"
            icon={TrendingDown}
            iconColor="text-red-500"
            showDetails
            details={getExpenseDetails(expenseDetails)}
          />
          <FinancialCard
            title="Investimentos"
            value={summary.totalInvestment}
            previousValue={previousSummary?.totalInvestment}
            description="Em equipamentos, infraestrutura e marketing"
            icon={LineChart}
            iconColor="text-blue-500"
            showDetails
            details={getInvestmentDetails(investmentDetails)}
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialDetails;
