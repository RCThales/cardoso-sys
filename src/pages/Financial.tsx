
import { Navbar } from "@/components/Navbar";
import { useFinancialData } from "@/hooks/useFinancialData";
import { YearSelector } from "@/components/financial/YearSelector";
import { MonthGrid } from "@/components/financial/MonthGrid";
import { YearlyReportButton } from "@/components/financial/YearlyReportButton";
import { DateRangeSelector } from "@/components/financial/DateRangeSelector";
import { PeriodReportButton } from "@/components/financial/PeriodReportButton";
import Loader from "@/components/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Financial = () => {
  const {
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
    isLoading
  } = useFinancialData();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Análise Financeira
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize os resultados financeiros por mês e ano ou período específico
          </p>
        </div>

        <Tabs defaultValue="year" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="year">Por Ano</TabsTrigger>
            <TabsTrigger value="period">Por Período</TabsTrigger>
          </TabsList>
          
          <TabsContent value="year">
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
          </TabsContent>
          
          <TabsContent value="period">
            <div className="space-y-8">
              <DateRangeSelector
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApply={applyDateFilter}
              />

              <PeriodReportButton
                startDate={startDate}
                endDate={endDate}
                months={filteredMonths}
              />

              {isLoading ? (
                <Loader />
              ) : (
                <MonthGrid
                  months={filteredMonths}
                  selectedYear={selectedYear}
                  isPeriodView={true}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Financial;
