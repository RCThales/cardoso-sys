
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
  const [salePrice, setSalePrice] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantities, setQuantities] = useState({});
  const [sizes, setSizes] = useState<string[]>([]);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id);
      } else {
        await createProduct(quantities);
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
    try {
      if (sizes.length === 0) {
        await productService.createProductWithoutSizes(
          { name, basePrice, sizes, salePrice },
          quantity
        );
      } else {
        await productService.createProductWithSizes(
          { name, basePrice, sizes, salePrice },
          quantities
        );
      }

      showToast("Sucesso", "Produto criado com sucesso");
    } catch (error) {
      console.error("Erro ao criar produto:", error.code, error.message);

      if (error.code === "23505") {
        showToast("Erro", "Produto com mesmo nome ou ID ja existe.");
      } else {
        throw error;
      }
    }
  };

  const updateProduct = async (productId: string) => {
    try {
      if (sizes.length === 0) {
        await productService.updateProductWithoutSizes(
          productId,
          { name, basePrice, sizes, salePrice },
          quantity
        );
      } else {
        await productService.updateProductWithSizes(
          productId,
          { name, basePrice, sizes, salePrice },
          quantities
        );
      }

      showToast("Sucesso", "Produto atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    }
  };

  const getInventoryQuantities = async (productId: string) => {
    try {
      const quantities = await productService.getInventoryQuantityWithSizes(
        productId
      );
      return quantities;
    } catch (error) {
      console.error("Erro ao obter quantidades do inventário:", error);
      showToast("Erro", "Erro ao obter quantidades do inventário", "destructive");
      return {};
    }
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
    setSalePrice("");
    setBasePrice("");
    setQuantity("");
    setQuantities({});
    setSizes([]);
  };

  const handleEdit = async (product: Product) => {
    try {
      if (product?.sizes?.length === 0) {
        const quantity = await getInventoryQuantities(product.id);
        const quantityValue = quantity["null"]?.toString() || "0";
        setQuantity(quantityValue);
      } else {
        const quantities = await getInventoryQuantities(product.id);
        setQuantities(quantities);
      }
      setSelectedProduct(product);
      setName(product.name);
      setBasePrice(product.base_price.toString());
      setSalePrice(product.sale_price.toString());
      setSizes((product.sizes || []).map((s) => s.size));
      setIsOpen(true);
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      showToast("Erro", "Erro ao carregar dados do produto", "destructive");
    }
  };

  const toggleProductDialog = () => {
    resetForm();
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    setIsOpen,
    selectedProduct,
    setSelectedProduct,
    name,
    setName,
    toggleProductDialog,
    basePrice,
    setBasePrice,
    quantity,
    setQuantity,
    quantities,
    setQuantities,
    salePrice,
    setSalePrice,
    sizes,
    setSizes,
    handleSubmit,
    handleEdit,
    resetForm,
  };
};
