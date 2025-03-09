import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, subMonths, addMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Navbar } from "@/components/Navbar";
import { DollarSign, TrendingDown, TrendingUp, LineChart, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { FinancialCard } from "@/components/financial/FinancialCard";
import { FinancialHeader } from "@/components/financial/FinancialHeader";
import { FinancialDetailsDialog } from "@/components/financial/FinancialDetailsDialog";
import { Button } from "@/components/ui/button";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

interface FinancialSummary {
  grossIncome: number;
  netProfit: number;
  totalExpenses: number;
  totalInvestment: number;
  totalRecurring: number;
  invoiceCount: number;
  averageTicket: number;
}

interface DetailsItem {
  name: string;
  amount: number;
}

const FinancialDetails = () => {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FinancialSummary>({
    grossIncome: 0,
    netProfit: 0,
    totalExpenses: 0,
    totalInvestment: 0,
    totalRecurring: 0,
    invoiceCount: 0,
    averageTicket: 0,
  });
  const [previousSummary, setPreviousSummary] =
    useState<FinancialSummary | null>(null);
  const [investmentDetails, setInvestmentDetails] = useState<DetailsItem[]>([]);
  const [expenseDetails, setExpenseDetails] = useState<DetailsItem[]>([]);
  const [recurringDetails, setRecurringDetails] = useState<DetailsItem[]>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeDetailsTitle, setActiveDetailsTitle] = useState("");
  const [activeDetails, setActiveDetails] = useState<{ description: string; amount: number }[]>([]);
  const [activeTotal, setActiveTotal] = useState(0);

  const monthName = month
    ? format(
        new Date(parseInt(year || ""), parseInt(month) - 1, 1),
        "MMMM 'de' yyyy",
        { locale: ptBR }
      )
    : "";

  const navigateToMonth = (direction: 'previous' | 'next') => {
    if (!year || !month) return;
    
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const newDate = direction === 'previous' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1);
    
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth() + 1;
    
    navigate(`/financial/${newYear}/${newMonth}`);
  };

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

  const getRecurringDetails = (
    recurrings: Array<{ name: string; amount: number; recurring_cancellation_date?: string | null }>
  ) => {
    return recurrings
      .filter(rec => !rec.recurring_cancellation_date)
      .map((rec) => ({
        description: rec.name,
        amount: Number(rec.amount),
      }));
  };

  const handleShowDetails = (
    title: string, 
    details: { description: string; amount: number }[], 
    total: number
  ) => {
    setActiveDetailsTitle(title);
    setActiveDetails(details);
    setActiveTotal(total);
    setDetailsDialogOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!year || !month) return;

      const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const previousDate = subMonths(currentDate, 1);

      const { data: currentInvestments } = await supabase
        .from("investments")
        .select("*")
        .gte("date", currentDate.toISOString())
        .lte(
          "date",
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).toISOString()
        );

      const { data: currentExpenses } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", currentDate.toISOString())
        .lte(
          "date",
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).toISOString()
        );

      const { data: currentRecurring } = await supabase
        .from("recurring")
        .select("*");

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

      const { data: previousInvestments } = await supabase
        .from("investments")
        .select("*")
        .gte("date", previousDate.toISOString())
        .lte(
          "date",
          new Date(
            previousDate.getFullYear(),
            previousDate.getMonth() + 1,
            0
          ).toISOString()
        );

      const { data: previousExpenses } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", previousDate.toISOString())
        .lte(
          "date",
          new Date(
            previousDate.getFullYear(),
            previousDate.getMonth() + 1,
            0
          ).toISOString()
        );

      const { data: previousRecurring } = await supabase
        .from("recurring")
        .select("*");

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

      setInvestmentDetails(currentInvestments || []);
      setExpenseDetails(currentExpenses || []);
      
      const filteredCurrentRecurring = currentRecurring?.filter(item => {
        return !item.recurring_cancellation_date || 
          new Date(item.recurring_cancellation_date) >= 
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }) || [];
      
      setRecurringDetails(filteredCurrentRecurring || []);

      const currentGrossIncome = currentInvoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      const totalInvestment = currentInvestments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const totalExpenses = currentExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const totalRecurring = filteredCurrentRecurring?.reduce((sum, rec) => sum + Number(rec.amount), 0) || 0;

      const currentSummary = {
        grossIncome: currentGrossIncome,
        netProfit: currentGrossIncome - totalExpenses - totalInvestment - totalRecurring,
        totalExpenses,
        totalInvestment,
        totalRecurring,
        invoiceCount: currentInvoices?.length || 0,
        averageTicket: currentInvoices?.length
          ? currentGrossIncome / currentInvoices.length
          : 0,
      };

      const filteredPreviousRecurring = previousRecurring?.filter(item => {
        return !item.recurring_cancellation_date || 
          new Date(item.recurring_cancellation_date) >= 
            new Date(previousDate.getFullYear(), previousDate.getMonth() + 1, 0);
      }) || [];

      const previousGrossIncome = previousInvoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      const prevTotalInvestment = previousInvestments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const prevTotalExpenses = previousExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const prevTotalRecurring = filteredPreviousRecurring?.reduce((sum, rec) => sum + Number(rec.amount), 0) || 0;

      if (previousInvoices && previousInvoices.length > 0) {
        setPreviousSummary({
          grossIncome: previousGrossIncome,
          netProfit: previousGrossIncome - prevTotalExpenses - prevTotalInvestment - prevTotalRecurring,
          totalExpenses: prevTotalExpenses,
          totalInvestment: prevTotalInvestment,
          totalRecurring: prevTotalRecurring,
          invoiceCount: previousInvoices.length,
          averageTicket: previousInvoices.length
            ? previousGrossIncome / previousInvoices.length
            : 0,
        });
      } else {
        setPreviousSummary(null);
      }

      setSummary(currentSummary);
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
        
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigateToMonth('previous')}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Mês Anterior
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigateToMonth('next')}
            className="flex items-center gap-1"
          >
            Próximo Mês
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
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
            onCardClick={() => handleShowDetails(
              "Despesas", 
              getExpenseDetails(expenseDetails), 
              summary.totalExpenses
            )}
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
            onCardClick={() => handleShowDetails(
              "Investimentos", 
              getInvestmentDetails(investmentDetails), 
              summary.totalInvestment
            )}
          />
          <FinancialCard
            title="Despesas Recorrentes"
            value={summary.totalRecurring}
            previousValue={previousSummary?.totalRecurring}
            description="Gastos mensais fixos"
            icon={CalendarRange}
            iconColor="text-amber-500"
            showDetails
            details={getRecurringDetails(recurringDetails)}
            onCardClick={() => handleShowDetails(
              "Despesas Recorrentes", 
              getRecurringDetails(recurringDetails), 
              summary.totalRecurring
            )}
          />
        </div>

        <FinancialDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          title={activeDetailsTitle}
          details={activeDetails}
          total={activeTotal}
        />
      </div>
    </div>
  );
};

export default FinancialDetails;
