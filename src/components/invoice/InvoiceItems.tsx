
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
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
  productId: string;
  rentalDays: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: string) => void;
  onRemoveItem: (index: number) => void;
}

export const InvoiceItems = ({ 
  items, 
  onAddItem, 
  onUpdateItem, 
  onRemoveItem 
}: InvoiceItemsProps) => {
  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = PRODUCTS.find(p => p.id === productId);
    if (selectedProduct) {
      const item = items[index];
      const rentalDays = Number(item.rentalDays) || 1;
      const quantity = Number(item.quantity) || 1;
      const dailyPrice = calculateTotalPrice(rentalDays, productId);
      const total = dailyPrice * quantity;
      
      // Primeiro atualiza o productId e a descrição
      onUpdateItem(index, "productId", productId);
      onUpdateItem(index, "description", selectedProduct.name);
      
      // Depois atualiza o preço e o total
      onUpdateItem(index, "price", dailyPrice.toString());
      onUpdateItem(index, "total", total.toString());
      
      console.log("Produto selecionado:", {
        name: selectedProduct.name,
        dailyPrice,
        total,
        quantity,
        rentalDays
      });
    }
  };

  const handleDaysChange = (index: number, days: string) => {
    const item = items[index];
    if (item.productId) {
      const rentalDays = Number(days) || 1;
      const quantity = Number(item.quantity) || 1;
      const dailyPrice = calculateTotalPrice(rentalDays, item.productId);
      const total = dailyPrice * quantity;
      
      onUpdateItem(index, "rentalDays", days);
      onUpdateItem(index, "price", dailyPrice.toString());
      onUpdateItem(index, "total", total.toString());
    }
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const item = items[index];
    if (item.productId && item.rentalDays) {
      const quantityNum = Number(quantity) || 1;
      const rentalDays = Number(item.rentalDays) || 1;
      const dailyPrice = calculateTotalPrice(rentalDays, item.productId);
      const total = dailyPrice * quantityNum;
      
      onUpdateItem(index, "quantity", quantity);
      onUpdateItem(index, "total", total.toString());
    }
  };

  const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  const handleRemoveItem = (index: number) => {
    if (typeof onRemoveItem === 'function') {
      onRemoveItem(index);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produto
            </label>
            <Select
              value={item.productId || ""}
              onValueChange={(value) => handleProductChange(index, value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione um produto">
                  {item.description || "Selecione um produto"}
                </SelectValue>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dias
            </label>
            <Input
              type="number"
              placeholder="Dias"
              value={item.rentalDays.toString()}
              onChange={(e) => handleDaysChange(index, e.target.value)}
              min={1}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade
            </label>
            <Input
              type="number"
              placeholder="Qtd"
              value={item.quantity.toString()}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              min={1}
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total
            </label>
            <Input
              value={`R$ ${formatCurrency(item.total)}`}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="col-span-1 flex items-end">
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => handleRemoveItem(index)}
              className="h-10 w-10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
