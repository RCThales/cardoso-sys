
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

interface MonthData {
  month: number;
  year: number;
  label: string;
  count: number;
}

const Financial = () => {
  const navigate = useNavigate();
  const [years, setYears] = useState<number[]>([]);
  const [monthsByYear, setMonthsByYear] = useState<Record<number, MonthData[]>>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("*")
        .order("invoice_date", { ascending: true });

      if (error) {
        console.error("Error fetching invoices:", error);
        return;
      }

      const monthsData: Record<number, Record<number, MonthData>> = {};
      const yearsSet = new Set<number>();

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
          };
        }

        monthsData[year][month].count++;
      });

      const processedYears = Array.from(yearsSet).sort((a, b) => b - a);
      const processedMonths: Record<number, MonthData[]> = {};

      processedYears.forEach(year => {
        processedMonths[year] = Object.values(monthsData[year]).sort((a, b) => a.month - b.month);
      });

      setYears(processedYears);
      setMonthsByYear(processedMonths);
      if (processedYears.length > 0) {
        setSelectedYear(processedYears[0]);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Análise Financeira</h1>
          <p className="text-muted-foreground mt-2">
            Visualize os resultados financeiros por mês e ano
          </p>
        </div>

        <Tabs defaultValue={selectedYear.toString()} className="space-y-4">
          <TabsList>
            {years.map(year => (
              <TabsTrigger
                key={year}
                value={year.toString()}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </TabsTrigger>
            ))}
          </TabsList>

          {years.map(year => (
            <TabsContent key={year} value={year.toString()} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {monthsByYear[year]?.map(month => (
                  <Button
                    key={`${year}-${month.month}`}
                    variant="outline"
                    className="h-auto py-8 flex flex-col gap-2"
                    onClick={() => navigate(`/financial/${year}/${month.month + 1}`)}
                  >
                    <span className="text-lg font-semibold capitalize">
                      {month.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {month.count} faturas
                    </span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Financial;
