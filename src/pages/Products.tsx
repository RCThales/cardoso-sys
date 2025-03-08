import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/utils/priceCalculator";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSearch } from "@/components/products/ProductSearch";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { useProductForm } from "@/hooks/useProductForm";
import { productService } from "@/services/productService";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  const {
    isOpen,
    toggleProductDialog,
    selectedProduct,
    setSelectedProduct,
    name,
    setName,
    basePrice,
    setBasePrice,
    salePrice,
    setSalePrice,
    sizes,
    setSizes,
    quantity,
    setQuantity,
    quantities,
    setQuantities,
    handleSubmit,
    handleEdit,
  } = useProductForm({
    onSuccess: refetch,
  });

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await productService.deleteProduct(selectedProduct.id);
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8">
        <ProductsHeader onNewProduct={() => toggleProductDialog()} />
        <ProductSearch searchTerm={searchTerm} onSearch={setSearchTerm} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={(product) => {
                setSelectedProduct(product);
                setIsDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={toggleProductDialog}>
          <DialogContent className="min-w-[100vw] w-screen h-screen overflow-y-scroll md:max-h-[95vh] md:w-auto md:h-auto md:min-w-[500px] flex flex-col justify-start ">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={(e) => handleSubmit(e)}
              name={name}
              setName={setName}
              basePrice={basePrice}
              setBasePrice={setBasePrice}
              selectedProduct={selectedProduct}
              salePrice={salePrice}
              setSalePrice={setSalePrice}
              sizes={sizes}
              quantity={quantity}
              setQuantity={setQuantity}
              quantities={quantities}
              setQuantities={setQuantities}
              setSizes={setSizes}
              setInitialQuantity={() => {}}
            />
          </DialogContent>
        </Dialog>

        <DeleteProductDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          productName={selectedProduct?.name || ""}
        />
      </div>
    </div>
  );
};

export default Products;
