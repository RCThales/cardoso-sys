
import { InvestmentItem } from "./InvestmentItem";

interface InvestmentsListProps {
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onCancelRecurring?: (item: any) => void;
  isRecurring?: boolean;
}

export const InvestmentsList = ({ 
  items, 
  onEdit, 
  onDelete, 
  onCancelRecurring,
  isRecurring = false 
}: InvestmentsListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhum item encontrado no período selecionado
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <InvestmentItem 
          key={item.id}
          item={item} 
          onEdit={onEdit} 
          onDelete={onDelete}
          onCancelRecurring={onCancelRecurring}
          isRecurring={isRecurring}
        />
      ))}
    </div>
  );
};
