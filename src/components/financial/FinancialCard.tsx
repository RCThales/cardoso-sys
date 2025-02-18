
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, LucideIcon } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { generateFinancialPDF } from "@/utils/financialPdfGenerator";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinancialCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  summary: {
    grossIncome: number;
    expenses: number;
    netProfit: number;
    totalInvestment: number;
    invoiceCount: number;
    averageTicket: number;
  };
  monthName: string;
}

export const FinancialCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  summary,
  monthName,
}: FinancialCardProps) => {
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownloadPDF}
            title="Baixar relatório em PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">R$ {formatCurrency(value)}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
