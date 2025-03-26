import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/utils/formatters";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinancialDetail {
  name: string;
  description: string;
  amount: number;
  date?: string;
}

export interface MonthFinancialData {
  month: number;
  year: number;
  label: string;
  totalInvoices: number;
  totalExpenses: number;
  totalInvestments: number;
  totalRecurring: number;
  balance: number;
}

export interface FinancialDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthData?: MonthFinancialData;
  // Include the direct detail props
  title?: string;
  details?: FinancialDetail[];
  total?: number;
}

export const FinancialDetailsDialog = ({
  open,
  onOpenChange,
  monthData,
  title,
  details,
  total,
}: FinancialDetailsDialogProps) => {
  const [invoices, setInvoices] = useState<FinancialDetail[]>([]);
  const [expenses, setExpenses] = useState<FinancialDetail[]>([]);
  const [investments, setInvestments] = useState<FinancialDetail[]>([]);
  const [recurring, setRecurring] = useState<FinancialDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialDetails = async () => {
      if (!open || !monthData) return;

      setIsLoading(true);

      try {
        // Create exact day boundaries for the month
        const startDate = startOfDay(
          new Date(monthData.year, monthData.month, 1)
        );
        const endDate = endOfDay(
          new Date(monthData.year, monthData.month + 1, 0)
        );

        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

        // Fetch invoices
        const { data: invoicesData } = await supabase
          .from("invoices")
          .select("*")
          .gte("invoice_date", startDateStr)
          .lte("invoice_date", endDateStr);

        // Fetch expenses
        const { data: expensesData } = await supabase
          .from("expenses")
          .select("*")
          .gte("date", startDateStr)
          .lte("date", endDateStr);

        // Fetch investments
        const { data: investmentsData } = await supabase
          .from("investments")
          .select("*")
          .gte("date", startDateStr)
          .lte("date", endDateStr);

        // Fetch recurring
        const { data: recurringData } = await supabase
          .from("recurring")
          .select("*")
          .gte("date", startDateStr)
          .lte("date", endDateStr);

        // Process invoices
        setInvoices(
          invoicesData?.map((invoice) => ({
            name: `Fatura #${invoice.id}`,
            description: invoice.client_name || "Cliente não especificado",
            amount: invoice.total || 0,
            date: invoice.invoice_date,
          })) || []
        );

        // Process expenses
        setExpenses(
          expensesData?.map((expense) => ({
            name: expense.name || "Despesa",
            description: expense.description || "",
            amount: expense.amount || 0,
            date: expense.date,
          })) || []
        );

        // Process investments
        setInvestments(
          investmentsData?.map((investment) => ({
            name: investment.name || "Investimento",
            description: investment.description || "",
            amount: investment.amount || 0,
            date: investment.date,
          })) || []
        );

        // Process recurring
        setRecurring(
          recurringData?.map((rec) => ({
            name: rec.name || "Recorrente",
            description: rec.description || "",
            amount: rec.amount || 0,
            date: rec.date,
          })) || []
        );
      } catch (error) {
        console.error("Erro ao buscar detalhes financeiros:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialDetails();
  }, [open, monthData]);

  // For direct details rendering mode (when title, details and total are provided)
  const renderDirectDetails = () => {
    if (!details || !details.length) {
      return (
        <div className="py-4 text-center text-muted-foreground">
          Nenhum registro encontrado
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div
            key={`${detail.name}_${index}`}
            className="flex justify-between items-start py-2 border-b last:border-b-0"
          >
            <div className="space-y-1">
              <div className="font-medium">{detail.name}</div>
              <div className="text-sm text-muted-foreground">
                {detail.description}
              </div>
              {detail.date && (
                <div className="text-xs text-muted-foreground">
                  {formatDate(detail.date)}
                </div>
              )}
            </div>
            <span className="font-medium">
              R$ {formatCurrency(detail.amount)}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4 border-t-2">
          <span className="font-bold">Total</span>
          <span className="font-bold">R$ {formatCurrency(total || 0)}</span>
        </div>
      </div>
    );
  };

  const formatMonthTitle = () => {
    if (!monthData) return title || "Detalhes Financeiros";
    const monthName =
      monthData.label.charAt(0).toUpperCase() + monthData.label.slice(1);
    return `${monthName} de ${monthData.year}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const renderDetails = (
    details: FinancialDetail[],
    total: number,
    showDates = true
  ) => {
    if (isLoading) {
      return <div className="py-4 text-center">Carregando...</div>;
    }

    if (!details.length) {
      return (
        <div className="py-4 text-center text-muted-foreground">
          Nenhum registro encontrado
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div
            key={`${detail.name}_${index}`}
            className="flex justify-between items-start py-2 border-b last:border-b-0"
          >
            <div className="space-y-1">
              <div className="font-medium">{detail.name}</div>
              <div className="text-sm text-muted-foreground">
                {detail.description}
              </div>
              {showDates && detail.date && (
                <div className="text-xs text-muted-foreground">
                  {formatDate(detail.date)}
                </div>
              )}
            </div>
            <span className="font-medium">
              R$ {formatCurrency(detail.amount)}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4 border-t-2">
          <span className="font-bold">Total</span>
          <span className="font-bold">R$ {formatCurrency(total)}</span>
        </div>
      </div>
    );
  };

  // If we have direct details, render those instead of the tabs
  if (title && details) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </DialogHeader>

          <div className="mt-4 px-1">{renderDirectDetails()}</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise, render the month data with tabs
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{formatMonthTitle()}</DialogTitle>
        </DialogHeader>

        {monthData && (
          <>
            <Tabs defaultValue="invoices" className="mt-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="invoices">Receitas</TabsTrigger>
                <TabsTrigger value="expenses">Despesas</TabsTrigger>
                <TabsTrigger value="investments">Investimentos</TabsTrigger>
                <TabsTrigger value="recurring">Recorrentes</TabsTrigger>
              </TabsList>

              <TabsContent value="invoices" className="px-1">
                {renderDetails(invoices, monthData.totalInvoices)}
              </TabsContent>

              <TabsContent value="expenses" className="px-1">
                {renderDetails(expenses, monthData.totalExpenses)}
              </TabsContent>

              <TabsContent value="investments" className="px-1">
                {renderDetails(investments, monthData.totalInvestments)}
              </TabsContent>

              <TabsContent value="recurring" className="px-1">
                {renderDetails(recurring, monthData.totalRecurring)}
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Saldo Final</span>
                <span
                  className={
                    monthData.balance >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  R$ {formatCurrency(monthData.balance)}
                </span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
