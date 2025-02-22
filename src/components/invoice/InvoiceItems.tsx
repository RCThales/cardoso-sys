import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/utils/priceCalculator";
import { InvoiceItem } from "./types";
import { Tag, Calendar } from "lucide-react"; // Importe os ícones necessários

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onAddItem?: () => void;
  onUpdateItem?: (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => void;
  onRemoveItem?: (index: number) => void;
  readOnly?: boolean;
}

export const InvoiceItems = ({ items }: InvoiceItemsProps) => {
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

      <div className="border rounded-lg overflow-hidden">
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

              // Determina o tipo do item (VENDA ou ALUGUEL)
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
                    {item.rentalDays || 1}
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
