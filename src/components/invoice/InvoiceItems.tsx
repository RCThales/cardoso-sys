
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: string) => void;
}

export const InvoiceItems = ({ items, onAddItem, onUpdateItem }: InvoiceItemsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Itens</h3>
        <Button onClick={onAddItem}>Adicionar Item</Button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Input
              placeholder="Descrição"
              value={item.description}
              onChange={(e) =>
                onUpdateItem(index, "description", e.target.value)
              }
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              placeholder="Qtd"
              value={item.quantity}
              onChange={(e) => onUpdateItem(index, "quantity", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              placeholder="Preço"
              value={item.price}
              onChange={(e) => onUpdateItem(index, "price", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Input
              value={`R$ ${item.total.toFixed(2)}`}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
