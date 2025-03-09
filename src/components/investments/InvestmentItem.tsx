
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface InvestmentItemProps {
  item: {
    id: number;
    name: string;
    amount: number;
    date: string;
    description: string | null;
  };
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export const InvestmentItem = ({ item, onEdit, onDelete }: InvestmentItemProps) => {
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
      </CardContent>
    </Card>
  );
};
