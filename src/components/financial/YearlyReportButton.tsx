
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { generateYearlyFinancialPDF } from "@/utils/financialPdfGenerator";
import { saveAs } from "file-saver";
import { useToast } from "@/components/ui/use-toast";
import { MonthData } from "@/hooks/useFinancialData";

interface YearlyReportButtonProps {
  selectedYear: number;
  months: MonthData[];
}

export const YearlyReportButton = ({ selectedYear, months }: YearlyReportButtonProps) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadYearlyPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Preparar dados para o relatório anual
      const yearlyData = {
        year: selectedYear,
        totalInvoices: 0,
        totalInvestments: 0,
        totalExpenses: 0,
        totalRecurring: 0,
        balance: 0,
        monthsData: months?.map(month => ({
          month: month.month,
          label: month.label,
          invoices: month.totalInvoices,
          investments: month.totalInvestments,
          expenses: month.totalExpenses,
          recurring: month.totalRecurring,
        })) || [],
      };
      
      // Calcular totais
      months?.forEach(month => {
        yearlyData.totalInvoices += month.totalInvoices;
        yearlyData.totalInvestments += month.totalInvestments;
        yearlyData.totalExpenses += month.totalExpenses;
        yearlyData.totalRecurring += month.totalRecurring;
      });
      
      yearlyData.balance = 
        yearlyData.totalInvoices - 
        yearlyData.totalInvestments - 
        yearlyData.totalExpenses -
        yearlyData.totalRecurring;
      
      const pdfBlob = await generateYearlyFinancialPDF(yearlyData);
      const fileName = `relatorio-financeiro-anual-${selectedYear}.pdf`;
      saveAs(pdfBlob, fileName);
      
      toast({
        title: "Relatório gerado com sucesso",
        description: `O relatório anual de ${selectedYear} foi gerado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF anual:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório anual.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownloadYearlyPDF}
      className="w-fit"
      disabled={isGeneratingPDF || !months?.length}
    >
      <Download className="h-4 w-4 mr-2" />
      Baixar Relatório Anual
    </Button>
  );
};
