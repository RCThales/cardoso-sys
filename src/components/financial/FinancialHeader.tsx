
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FinancialHeaderProps {
  monthName: string;
}

export const FinancialHeader = ({ monthName }: FinancialHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-8">
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
  );
};
