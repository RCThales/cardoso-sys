import { useState } from "react";
import type { Product } from "@/utils/priceCalculator";
import { useToast } from "./use-toast";
import { productService } from "@/services/productService";

interface UseProductFormProps {
  onSuccess: () => void;
}

export const useProductForm = ({ onSuccess }: UseProductFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);

  const { toast } = useToast();

  const handleSubmit = async (
    e: React.FormEvent,
    quantities: Record<string, number>
  ) => {
    e.preventDefault();

    try {
      if (selectedProduct) {
        updateProduct(selectedProduct.id, quantities);
      } else {
        createProduct(quantities);
      }

      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Erro ao processar o produto:", error);
      showToast(
        "Erro",
        selectedProduct
          ? "Erro ao atualizar produto"
          : "Erro ao adicionar produto",
        "destructive"
      );
    }
  };

  const createProduct = async (quantities) => {
    await productService.createProduct({ name, basePrice, sizes }, quantities);
    showToast("Sucesso", "Produto atualizado com sucesso");
  };

  const updateProduct = async (productId: string, quantities) => {
    await productService.updateProduct(
      productId,
      { name, basePrice, sizes },
      quantities
    );
    showToast("Sucesso", "Produto atualizado com sucesso");
  };

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    toast({ title, description, variant });
  };

  const resetForm = () => {
    setIsOpen(false);
    setSelectedProduct(null);
    setName("");
    setBasePrice("");
    setSizes([]);
  };

  const handleEdit = async (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setBasePrice(product.base_price.toString());
    setSizes((product.sizes || []).map((s) => s.size));
    setIsOpen(true);
  };

  return {
    isOpen,
    setIsOpen,
    selectedProduct,
    setSelectedProduct,
    name,
    setName,
    basePrice,
    setBasePrice,
    sizes,
    setSizes,

    handleSubmit,
    handleEdit,
    resetForm,
  };
};
