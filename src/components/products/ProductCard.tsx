import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/utils/priceCalculator";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard = ({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-muted-foreground">
            Valor base: R$ {product.base_price.toFixed(2)}
          </p>
          <p className="text-muted-foreground">
            Valor de Venda: {product.sale_price.toFixed(2)}
          </p>
          <p className="text-muted-foreground">
            Código: {product.product_code}
          </p>
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-1">Tamanhos:</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: { size: string }) => (
                  <Badge key={size.size} variant="secondary">
                    {size.size}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-500 hover:text-blue-800 hover:bg-blue-300 dark:hover:bg-blue-800 dark:hover:text-white"
            onClick={() => onEdit(product)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/20 dark:hover:bg-destructive/80 dark:hover:text-white"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
