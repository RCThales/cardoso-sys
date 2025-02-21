import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/utils/priceCalculator";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSearch } from "@/components/products/ProductSearch";

const Products = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState<string>();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;

    const searchTermLower = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTermLower) ||
        product.product_code.toLowerCase().includes(searchTermLower)
    );
  }, [products, searchTerm]);

  const handleEdit = async (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setBasePrice(product.base_price.toString());
    setSizes((product.sizes || []).map((s) => s.size));

    const { data: inventoryData, error } = await supabase
      .from("inventory")
      .select("size, total_quantity")
      .eq("product_id", product.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar quantidades do inventário",
        variant: "destructive",
      });
      return;
    }

    const quantities = {};
    inventoryData.forEach((item) => {
      quantities[item.size] = item.total_quantity;
    });

    setQuantities(quantities);
    setIsOpen(true);
  };

  const handleSubmit = async (
    e: React.FormEvent,
    quantities: Record<string, number>
  ) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, quantities);
        showToast("Sucesso", "Produto atualizado com sucesso");
      } else {
        await createProduct(quantities);
        showToast("Sucesso", "Produto adicionado com sucesso");
      }

      resetForm();
      refetch();
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

  const updateProduct = async (
    productId: string,
    quantities: Record<string, number>
  ) => {
    const { error: productError } = await supabase
      .from("products")
      .update({
        name,
        base_price: parseFloat(basePrice),
        sizes: sizes.map((size) => ({ size })),
      })
      .eq("id", productId);

    if (productError) throw productError;

    if (sizes.length === 0) {
      const { error: deleteError } = await supabase
        .from("inventory")
        .delete()
        .eq("product_id", productId);

      if (deleteError) throw deleteError;

      const { error: createError } = await supabase
        .from("inventory")
        .insert({
          product_id: productId,
          size: null,
          total_quantity: 0,
          rented_quantity: 0,
        });

      if (createError) throw createError;
    } else {
      await updateInventory(productId, quantities);
    }
  };

  const updateInventory = async (
    productId: string,
    quantities: Record<string, number>
  ) => {
    const { error: deleteError } = await supabase
      .from("inventory")
      .delete()
      .eq("product_id", productId);

    if (deleteError) throw deleteError;

    if (sizes.length === 0) {
      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert({
          product_id: productId,
          size: null,
          total_quantity: 0,
          rented_quantity: 0,
        });

      if (inventoryError) throw inventoryError;
    } else {
      for (const size of sizes) {
        const totalQuantity = quantities[size] || 0;

        const { error: inventoryError } = await supabase
          .from("inventory")
          .insert({
            product_id: productId,
            size,
            total_quantity: totalQuantity,
            rented_quantity: 0,
          });

        if (inventoryError) throw inventoryError;
      }
    }
  };

  const createProduct = async (quantities: Record<string, number>) => {
    const productCode =
      "#" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const productId = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const { data: insertedProducts, error: productError } = await supabase
      .from("products")
      .insert([
        {
          id: productId,
          name,
          base_price: parseFloat(basePrice),
          product_code: productCode,
          sizes: sizes.map((size) => ({ size })),
        },
      ])
      .select("id")
      .single();

    if (productError) throw productError;

    await createInventory(insertedProducts.id, quantities);
  };

  const createInventory = async (
    productId: string,
    quantities: Record<string, number>
  ) => {
    const { error: deleteError } = await supabase
      .from("inventory")
      .delete()
      .eq("product_id", productId);

    if (deleteError) throw deleteError;

    if (sizes.length === 0) {
      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert({
          product_id: productId,
          size: null,
          total_quantity: 0,
          rented_quantity: 0,
        });

      if (inventoryError) throw inventoryError;
    } else {
      for (const size of sizes) {
        const totalQuantity = quantities[size] || 0;

        const { error: inventoryError } = await supabase
          .from("inventory")
          .insert({
            product_id: productId,
            size,
            total_quantity: totalQuantity,
            rented_quantity: 0,
          });

        if (inventoryError) throw inventoryError;
      }
    }
  };

  const updateProductWithoutInventoryUpdate = async (
    productId: string,
    quantities: Record<string, number>
  ) => {
    const { error: productError } = await supabase
      .from("products")
      .update({
        name,
        base_price: parseFloat(basePrice),
        sizes: sizes.map((size) => ({ size })),
      })
      .eq("id", productId);

    if (productError) throw productError;
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
    setQuantities({});
    setQuantity(undefined);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id);
      showToast("Sucesso", "Produto excluído com sucesso");
      resetSelection();
      refetch();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      showToast("Erro", "Erro ao excluir produto", "destructive");
    }
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Erro ao deletar produto:", error);
    } else {
      console.log("Produto deletado com sucesso!");
    }
  };

  const resetSelection = () => {
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setSelectedProduct(null);
    setName("");
    setBasePrice("");
    setSizes([]);
    setQuantities({});
    setQuantity(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Produtos</h1>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <ProductSearch searchTerm={searchTerm} onSearch={setSearchTerm} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
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

        <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={handleSubmit}
              name={name}
              setName={setName}
              basePrice={basePrice}
              setBasePrice={setBasePrice}
              selectedProduct={selectedProduct}
              sizes={sizes}
              setSizes={setSizes}
              setInitialQuantity={setQuantity}
              initialQuantity={quantity}
              initialQuantities={quantities}
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
