
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, TrendingDown, TrendingUp, DollarSign, LineChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatCurrency } from "@/utils/formatters";

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
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FinancialSummary>({
    grossIncome: 0,
    expenses: 0,
    netProfit: 0,
    totalInvestment: 50000,
    invoiceCount: 0,
    averageTicket: 0,
  });

  useEffect(() => {
    const fetchMonthData = async () => {
      if (!year || !month) return;

      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("*")
        .gte("invoice_date", startDate.toISOString())
        .lte("invoice_date", endDate.toISOString());

      if (error) {
        console.error("Error fetching monthly data:", error);
        return;
      }

      const financialSummary = invoices.reduce(
        (acc: FinancialSummary, invoice: InvoiceRow) => {
          acc.grossIncome += Number(invoice.total);
          const expenses = Number(invoice.total) * 0.2;
          acc.expenses += expenses;
          acc.netProfit += Number(invoice.total) - expenses;
          acc.invoiceCount++;
          return acc;
        },
        {
          grossIncome: 0,
          expenses: 0,
          netProfit: 0,
          totalInvestment: 50000,
          invoiceCount: 0,
          averageTicket: 0,
        }
      );

      financialSummary.averageTicket = 
        financialSummary.invoiceCount > 0 
          ? financialSummary.grossIncome / financialSummary.invoiceCount 
          : 0;

      setSummary(financialSummary);
    };

    fetchMonthData();
  }, [year, month]);

  const monthName = month ? format(new Date(parseInt(year || ""), parseInt(month) - 1, 1), "MMMM 'de' yyyy", { locale: ptBR }) : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate("/financial")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight capitalize">
              {monthName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Resumo financeiro do período
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Bruta
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {formatCurrency(summary.grossIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.invoiceCount} faturas no período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {formatCurrency(summary.expenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                Inclui descontos e custos operacionais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lucro Líquido
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {formatCurrency(summary.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                Após descontos e despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Investimento Total
              </CardTitle>
              <LineChart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {formatCurrency(summary.totalInvestment)}
              </div>
              <p className="text-xs text-muted-foreground">
                Em equipamentos e infraestrutura
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {formatCurrency(summary.averageTicket)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor médio por fatura
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialDetails;
