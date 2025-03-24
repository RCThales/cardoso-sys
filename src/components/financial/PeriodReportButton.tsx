
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { generatePeriodFinancialPDF } from "@/utils/financialPdfGenerator";
import { saveAs } from "file-saver";
import { useToast } from "@/components/ui/use-toast";
import { MonthData } from "@/hooks/useFinancialData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PeriodReportButtonProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  months: MonthData[];
}

export const PeriodReportButton = ({ 
  startDate, 
  endDate, 
  months 
}: PeriodReportButtonProps) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPeriodPDF = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Selecione um período",
        description: "Selecione uma data de início e fim para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingPDF(true);
      
      // Preparar dados para o relatório do período
      const periodData = {
        startDate,
        endDate,
        totalInvoices: 0,
        totalInvestments: 0,
        totalExpenses: 0,
        totalRecurring: 0,
        balance: 0,
        monthsData: months?.map(month => ({
          month: month.month,
          year: month.year,
          label: month.label,
          invoices: month.totalInvoices,
          investments: month.totalInvestments,
          expenses: month.totalExpenses,
          recurring: month.totalRecurring,
        })) || [],
      };
      
      // Calcular totais
      months?.forEach(month => {
        periodData.totalInvoices += month.totalInvoices;
        periodData.totalInvestments += month.totalInvestments;
        periodData.totalExpenses += month.totalExpenses;
        periodData.totalRecurring += month.totalRecurring;
      });
      
      periodData.balance = 
        periodData.totalInvoices - 
        periodData.totalInvestments - 
        periodData.totalExpenses -
        periodData.totalRecurring;
      
      const pdfBlob = await generatePeriodFinancialPDF(periodData);
      
      const startDateFormatted = format(startDate, "dd-MM-yyyy", { locale: ptBR });
      const endDateFormatted = format(endDate, "dd-MM-yyyy", { locale: ptBR });
      const fileName = `relatorio-financeiro-${startDateFormatted}-ate-${endDateFormatted}.pdf`;
      
      saveAs(pdfBlob, fileName);
      
      toast({
        title: "Relatório gerado com sucesso",
        description: `O relatório do período selecionado foi gerado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF do período:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório do período.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownloadPeriodPDF}
      className="w-fit"
      disabled={isGeneratingPDF || !months?.length || !startDate || !endDate}
    >
      <Download className="h-4 w-4 mr-2" />
      Baixar Relatório do Período
    </Button>
  );
};
