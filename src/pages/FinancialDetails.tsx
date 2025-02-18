
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
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

  const monthName = month 
    ? format(new Date(parseInt(year || ""), parseInt(month) - 1, 1), "MMMM 'de' yyyy", { locale: ptBR }) 
    : "";

  useEffect(() => {
    const fetchData = async () => {
      if (!year || !month) return;

      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .gte("invoice_date", startDate.toISOString())
        .lte("invoice_date", endDate.toISOString());

      if (invoicesError) {
        console.error("Error fetching monthly data:", invoicesError);
        return;
      }

      const { data: investments, error: investmentsError } = await supabase
        .from("investments")
        .select("amount");

      if (investmentsError) {
        console.error("Error fetching investments:", investmentsError);
        return;
      }

      const totalInvestment = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);

      let grossIncome = 0;
      let expenses = 0;
      let invoiceCount = 0;

      invoices.forEach((invoice: InvoiceRow) => {
        grossIncome += Number(invoice.total);
        expenses += Number(invoice.total) * 0.2;
        invoiceCount++;
      });

      const netProfit = grossIncome - expenses - totalInvestment;
      const averageTicket = invoiceCount > 0 ? grossIncome / invoiceCount : 0;

      setSummary({
        grossIncome,
        expenses,
        netProfit,
        totalInvestment,
        invoiceCount,
        averageTicket,
      });
    };

    fetchData();
  }, [year, month]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <FinancialHeader monthName={monthName} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FinancialCard
            title="Receita Bruta"
            value={summary.grossIncome}
            description={`${summary.invoiceCount} faturas no período`}
            icon={DollarSign}
            iconColor="text-green-500"
            summary={summary}
            monthName={monthName}
          />
          <FinancialCard
            title="Despesas"
            value={summary.expenses}
            description="Inclui descontos e custos operacionais"
            icon={TrendingDown}
            iconColor="text-red-500"
            summary={summary}
            monthName={monthName}
          />
          <FinancialCard
            title="Lucro Líquido"
            value={summary.netProfit}
            description="Após despesas e investimentos"
            icon={TrendingUp}
            iconColor="text-emerald-500"
            summary={summary}
            monthName={monthName}
          />
          <FinancialCard
            title="Investimento Total"
            value={summary.totalInvestment}
            description="Em equipamentos e infraestrutura"
            icon={LineChart}
            iconColor="text-blue-500"
            summary={summary}
            monthName={monthName}
          />
          <FinancialCard
            title="Ticket Médio"
            value={summary.averageTicket}
            description="Valor médio por fatura"
            icon={DollarSign}
            iconColor="text-purple-500"
            summary={summary}
            monthName={monthName}
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialDetails;
