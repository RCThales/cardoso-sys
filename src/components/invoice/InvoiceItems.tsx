import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { calculateTotalPrice, fetchProducts } from "@/utils/priceCalculator";
import { InvoiceItem } from "./types";
import { Tag, Calendar } from "lucide-react"; // Import necessary icons
import { Input } from "../ui/input";
import { useState } from "react";

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onAddItem?: () => void;
  onUpdateItem?: (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => void;
  onRemoveItem?: (index: number) => void;
  onUpdateRentalDays?: (index: number, days: string) => void;
  onUpdateTotal?: (index: number, total: number) => void; // Function to update total
  readOnly?: boolean;
}

export const InvoiceItems = ({
  items,
  onUpdateItem,
  onUpdateTotal, // Add this as a prop
  onUpdateRentalDays,
  readOnly = false,
}: InvoiceItemsProps) => {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const formatCurrency = (
    value: number | string | null | undefined
  ): string => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  if (!products) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Itens do Pedido</h3>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white dark:bg-card">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                Tipo
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                Produto
              </th>

              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                Dias
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                Quantidade
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const product = products.find((p) => p.id === item.productId);
              const productName = product ? (
                <>
                  {product.name}
                  {product.sizes.length > 0 && (
                    <span className="text-muted-foreground ml-2">
                      ({item.size})
                    </span>
                  )}
                </>
              ) : (
                item.description
              );

              // Determine the type of the item (SALE or RENTAL)
              const itemType = item.is_sale ? "VENDA" : "ALUGUEL";
              const itemIcon = item.is_sale ? (
                <Tag className="h-4 w-4 text-blue-500" />
              ) : (
                <Calendar className="h-4 w-4 text-green-500" />
              );

              return (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center space-x-2">
                      {itemIcon}
                      <span>{itemType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">{productName}</td>
                  <td className="px-4 py-3 align-middle">
                    {!item.is_sale && onUpdateRentalDays ? (
                      <RentalDaysInput
                        index={index}
                        rentalDays={item.rentalDays || 1}
                        basePrice={product ? product.base_price : 0}
                        onUpdateRentalDays={onUpdateRentalDays}
                        onUpdateTotal={onUpdateTotal}
                      />
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {item.quantity || 1}
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    R$ {formatCurrency(item.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RentalDaysInput = ({
  index,
  rentalDays,
  basePrice,
  onUpdateRentalDays,
  onUpdateTotal,
}: {
  index: number;
  rentalDays: number;
  basePrice: number;
  onUpdateRentalDays: (index: number, days: string) => void;
  onUpdateTotal: (index: number, total: number) => void; // Function to update total
}) => {
  const [inputValue, setInputValue] = useState<string>(rentalDays.toString());
  const [previousValue, setPreviousValue] = useState<string>(
    rentalDays.toString()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Recalculate the total price whenever the rental days change
    if (value !== "") {
      const newTotal = calculateTotalPrice(Number(value), basePrice);
      // Update the total in parent component
      if (onUpdateTotal) {
        onUpdateTotal(index, newTotal);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue === "") {
      // If empty, revert to previous value
      setInputValue(previousValue);
    } else {
      // If a valid number, update previous value and propagate change
      setPreviousValue(inputValue);
      onUpdateRentalDays(index, inputValue);
    }
  };

  return (
    <Input
      type="number"
      min="1"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-16 h-8 text-center"
    />
  );
};
