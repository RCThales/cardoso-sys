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

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

interface FinancialSummary {
  grossIncome: number;
  expenses: number;
  netProfit: number;
  totalInvestment: number;
  invoiceCount: number;
  averageTicket: number;
}

const FinancialDetails = () => {
  const { year, month } = useParams();
  const [summary, setSummary] = useState<FinancialSummary>({
    grossIncome: 0,
    expenses: 0,
    netProfit: 0,
    totalInvestment: 0,
    invoiceCount: 0,
    averageTicket: 0,
  });
  const [previousSummary, setPreviousSummary] = useState<FinancialSummary | null>(null);

  const monthName = month 
    ? format(new Date(parseInt(year || ""), parseInt(month) - 1, 1), "MMMM 'de' yyyy", { locale: ptBR }) 
    : "";

  const calculateExpenseDetails = (grossIncome: number) => [
    {
      description: "Custos operacionais (15%)",
      amount: grossIncome * 0.15,
    },
    {
      description: "Desconto de impostos (5%)",
      amount: grossIncome * 0.05,
    },
  ];

  const getInvestmentDetails = (investments: any[]) => {
    return investments.map(inv => ({
      description: inv.name,
      amount: Number(inv.amount),
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

      const { data: currentInvoices } = await supabase
        .from("invoices")
        .select("*")
        .gte("invoice_date", currentDate.toISOString())
        .lte("invoice_date", new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString());

      const { data: previousInvoices } = await supabase
        .from("invoices")
        .select("*")
        .gte("invoice_date", previousDate.toISOString())
        .lte("invoice_date", new Date(previousDate.getFullYear(), previousDate.getMonth() + 1, 0).toISOString());

      const currentGrossIncome = currentInvoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      const previousGrossIncome = previousInvoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      
      const currentExpenses = currentGrossIncome * 0.2;
      const previousExpenses = previousGrossIncome * 0.2;

      const totalInvestment = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

      const currentSummary = {
        grossIncome: currentGrossIncome,
        expenses: currentExpenses,
        netProfit: currentGrossIncome - currentExpenses - totalInvestment,
        totalInvestment,
        invoiceCount: currentInvoices?.length || 0,
        averageTicket: currentInvoices?.length ? currentGrossIncome / currentInvoices.length : 0,
      };

      const previousSummary = {
        grossIncome: previousGrossIncome,
        expenses: previousExpenses,
        netProfit: previousGrossIncome - previousExpenses - totalInvestment,
        totalInvestment,
        invoiceCount: previousInvoices?.length || 0,
        averageTicket: previousInvoices?.length ? previousGrossIncome / previousInvoices.length : 0,
      };

      setSummary(currentSummary);
      setPreviousSummary(previousSummary);
    };

    fetchData();
  }, [year, month]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <FinancialHeader monthName={monthName} summary={summary} />

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
            title="Despesas"
            value={summary.expenses}
            previousValue={previousSummary?.expenses}
            description="Inclui descontos e custos operacionais"
            icon={TrendingDown}
            iconColor="text-red-500"
            showDetails
            details={calculateExpenseDetails(summary.grossIncome)}
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
            title="Investimento Total"
            value={summary.totalInvestment}
            previousValue={previousSummary?.totalInvestment}
            description="Em equipamentos e infraestrutura"
            icon={LineChart}
            iconColor="text-blue-500"
            showDetails
            details={getInvestmentDetails(summary.investments || [])}
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
      </div>
    </div>
  );
};

export default FinancialDetails;
