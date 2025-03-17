import { Navbar } from "@/components/Navbar";
import { useFinancialData } from "@/hooks/useFinancialData";
import { YearSelector } from "@/components/financial/YearSelector";
import { MonthGrid } from "@/components/financial/MonthGrid";
import { YearlyReportButton } from "@/components/financial/YearlyReportButton";
import Loader from "@/components/loader";

const Financial = () => {
  const { years, monthsByYear, selectedYear, setSelectedYear, isLoading } =
    useFinancialData();

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

        {/* Dropdown para selecionar o ano e botão para baixar relatório anual */}
        <div className="flex mb-8 items-center flex-wrap gap-4">
          <YearSelector
            years={years}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />

          <YearlyReportButton
            selectedYear={selectedYear}
            months={monthsByYear[selectedYear] || []}
          />
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <MonthGrid
            months={monthsByYear[selectedYear] || []}
            selectedYear={selectedYear}
          />
        )}
      </div>
    </div>
  );
};

export default Financial;
