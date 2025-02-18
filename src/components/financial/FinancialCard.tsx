
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Circle, LucideIcon } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useState } from "react";
import { FinancialDetailsDialog } from "./FinancialDetailsDialog";

interface FinancialCardProps {
  title: string;
  value: number;
  previousValue?: number | null;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  details?: { description: string; amount: number }[];
  showDetails?: boolean;
}

export const FinancialCard = ({
  title,
  value,
  previousValue,
  description,
  icon: Icon,
  iconColor,
  details,
  showDetails = false,
}: FinancialCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getPercentageChange = () => {
    if (previousValue === null || previousValue === undefined) {
      return { icon: Circle, color: "text-gray-400", value: "0%" };
    }

    if (previousValue === 0 && value === 0) {
      return { 
        icon: Circle, 
        color: "text-gray-400", 
        value: "0%" 
      };
    }

    if (previousValue === 0 && value > 0) {
      return { 
        icon: ArrowUp, 
        color: "text-green-500", 
        value: "100%" 
      };
    }

    const percentageChange = ((value - previousValue) / previousValue) * 100;
    
    if (percentageChange === 0) {
      return { 
        icon: Circle, 
        color: "text-gray-400", 
        value: "0%" 
      };
    }

    return percentageChange > 0
      ? { 
          icon: ArrowUp, 
          color: "text-green-500", 
          value: `+${percentageChange.toFixed(1)}%` 
        }
      : { 
          icon: ArrowDown, 
          color: "text-red-500", 
          value: `${percentageChange.toFixed(1)}%` 
        };
  };

  const comparison = getPercentageChange();
  const ComparisonIcon = comparison.icon;

  return (
    <>
      <Card 
        className={showDetails ? "cursor-pointer hover:bg-accent/50 transition-colors" : ""}
        onClick={() => showDetails && setIsDialogOpen(true)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`flex items-center ${comparison.color} text-sm font-medium`}>
              <ComparisonIcon className="h-4 w-4 mr-1" />
              {comparison.value}
            </div>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {formatCurrency(value)}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>

      {showDetails && details && (
        <FinancialDetailsDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={title}
          details={details}
          total={value}
        />
      )}
    </>
  );
};
