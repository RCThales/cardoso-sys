
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateFinancialPDF } from "@/utils/financialPdfGenerator";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinancialHeaderProps {
  monthName: string;
  summary: {
    grossIncome: number;
    expenses: number;
    netProfit: number;
    totalInvestment: number;
    invoiceCount: number;
    averageTicket: number;
  };
}

export const FinancialHeader = ({ monthName, summary }: FinancialHeaderProps) => {
  const navigate = useNavigate();

  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await generateFinancialPDF(summary, monthName);
      const fileName = `relatorio-financeiro-${format(new Date(), "MMMM-yyyy", {
        locale: ptBR,
      })}.pdf`;
      saveAs(pdfBlob, fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-4">
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
      <Button 
        variant="outline" 
        onClick={handleDownloadPDF}
        className="w-fit"
      >
        <Download className="h-4 w-4 mr-2" />
        Baixar Relatório Completo
      </Button>
    </div>
  );
};
