
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MonthData } from "@/hooks/useFinancialData";

interface MonthGridProps {
  months: MonthData[];
  selectedYear: number;
}

export const MonthGrid = ({ months, selectedYear }: MonthGridProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {months?.map((month) => (
        <Button
          key={`${selectedYear}-${month.month}`}
          variant="outline"
          className="h-auto py-8 flex flex-col gap-2"
          onClick={() =>
            navigate(`/financial/${selectedYear}/${month.month + 1}`)
          }
        >
          <span className="text-lg font-semibold capitalize">
            {month.label}
          </span>
          <span className="text-sm text-muted-foreground">
            {month.count} faturas
          </span>
          <span className="text-sm text-muted-foreground">
            Saldo:{" "}
            {month.balance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </Button>
      ))}
    </div>
  );
};
