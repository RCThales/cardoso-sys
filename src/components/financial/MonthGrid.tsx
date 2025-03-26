
import { ChevronRight } from "lucide-react";
import { MonthData } from "@/hooks/useFinancialData";
import { useState } from "react";
import { FinancialDetailsDialog } from "./FinancialDetailsDialog";

interface MonthGridProps {
  months: MonthData[];
  selectedYear: number;
  isPeriodView?: boolean;
}

export const MonthGrid = ({ months, selectedYear, isPeriodView = false }: MonthGridProps) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Função para capitalizar a primeira letra de cada palavra
  const capitalize = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleMonthClick = (month: MonthData) => {
    setSelectedMonth(month);
    setIsDetailsOpen(true);
  };

  if (months.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        {isPeriodView
          ? "Nenhum dado encontrado para o período selecionado."
          : "Nenhum dado financeiro disponível para este ano."}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((month) => (
          <div
            key={`${month.year}-${month.month}`}
            className="bg-white dark:bg-card rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            onClick={() => handleMonthClick(month)}
          >
            <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium capitalize">
                {isPeriodView 
                  ? `${capitalize(month.label)} de ${month.year}`
                  : capitalize(month.label)}
              </h3>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between pb-2 border-b">
                <span className="font-medium">Receita</span>
                <span className="text-green-600">
                  {formatCurrency(month.totalInvoices)}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="font-medium">Despesas</span>
                <span className="text-red-600">
                  {formatCurrency(month.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="font-medium">Investimentos</span>
                <span className="text-blue-600">
                  {formatCurrency(month.totalInvestments)}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="font-medium">Recorrentes</span>
                <span className="text-amber-600">
                  {formatCurrency(month.totalRecurring)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1">
                <span>Saldo</span>
                <span
                  className={
                    month.balance >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatCurrency(month.balance)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedMonth && (
        <FinancialDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          monthData={selectedMonth}
        />
      )}
    </>
  );
};
