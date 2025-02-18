
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "../ui/select";
import { PRODUCTS, calculateTotalPrice } from "@/utils/priceCalculator";

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
  productId?: string;
  rentalDays?: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: string) => void;
}

export const InvoiceItems = ({ items, onAddItem, onUpdateItem }: InvoiceItemsProps) => {
  const handleProductChange = (index: number, productId: string) => {
    const item = items[index];
    const rentalDays = item.rentalDays || 1;
    const quantity = item.quantity || 1;
    const total = calculateTotalPrice(rentalDays, productId) * quantity;
    
    onUpdateItem(index, "productId", productId);
    onUpdateItem(index, "description", PRODUCTS.find(p => p.id === productId)?.name || "");
    onUpdateItem(index, "price", total.toString());
    onUpdateItem(index, "total", total.toString());
  };

  const handleDaysChange = (index: number, days: string) => {
    const item = items[index];
    if (item.productId) {
      const rentalDays = Number(days);
      const quantity = item.quantity || 1;
      const total = calculateTotalPrice(rentalDays, item.productId) * quantity;
      
      onUpdateItem(index, "rentalDays", days);
      onUpdateItem(index, "price", total.toString());
      onUpdateItem(index, "total", total.toString());
    }
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const item = items[index];
    if (item.productId && item.rentalDays) {
      const total = calculateTotalPrice(item.rentalDays, item.productId) * Number(quantity);
      
      onUpdateItem(index, "quantity", quantity);
      onUpdateItem(index, "total", total.toString());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Itens</h3>
        <Button onClick={onAddItem}>Adicionar Item</Button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <Select
              value={item.productId}
              onValueChange={(value) => handleProductChange(index, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              placeholder="Dias"
              value={item.rentalDays}
              onChange={(e) => handleDaysChange(index, e.target.value)}
              min={1}
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              placeholder="Qtd"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              min={1}
            />
          </div>
          <div className="col-span-4">
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
