
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash, Edit, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";

interface InvestmentItemProps {
  item: {
    id: number;
    name: string;
    amount: number;
    date: string;
    description: string | null;
    recurring_cancellation_date?: string | null;
  };
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onCancelRecurring?: (item: any) => void;
  isRecurring?: boolean;
}

export const InvestmentItem = ({ 
  item, 
  onEdit, 
  onDelete, 
  onCancelRecurring,
  isRecurring = false 
}: InvestmentItemProps) => {
  const isCancelled = item.recurring_cancellation_date !== null && item.recurring_cancellation_date !== undefined;
  
  return (
    <Card key={item.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>{item.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              R$ {formatCurrency(item.amount)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(item)}
            >
              <Trash className="h-4 w-4" />
            </Button>
            {isRecurring && onCancelRecurring && !isCancelled && (
              <Button
                variant="outline"
                onClick={() => onCancelRecurring(item)}
              >
                Cancelar recorrência
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {format(parseISO(item.date), "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}
        </p>
        {item.description && (
          <p className="text-sm">{item.description}</p>
        )}
        {isRecurring && isCancelled && (
          <div className="mt-2 flex items-center">
            <Ban className="h-4 w-4 mr-2 text-destructive" />
            <Badge variant="outline" className="text-destructive border-destructive">
              Recorrência cancelada em {format(parseISO(item.recurring_cancellation_date!), "dd/MM/yyyy", { locale: ptBR })}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
