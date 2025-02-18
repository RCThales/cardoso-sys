
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setBasePrice(product.base_price.toString());
    setSizes((product.sizes || []).map(s => s.size));
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sizeObjects = sizes.map(size => ({ size }));
      
      if (selectedProduct) {
        // Editar produto existente
        const { error } = await supabase
          .from("products")
          .update({
            name,
            base_price: parseFloat(basePrice),
            sizes: sizeObjects,
          })
          .eq("id", selectedProduct.id);

        if (error) throw error;

        // Atualizar o estoque para cada tamanho
        for (const size of sizes) {
          const { error: inventoryError } = await supabase
            .from("inventory")
            .upsert({
              product_id: selectedProduct.id,
              size,
              total_quantity: 0,
              rented_quantity: 0,
            }, {
              onConflict: 'product_id,size'
            });

          if (inventoryError) throw inventoryError;
        }

        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso",
        });
      } else {
        // Criar novo produto
        const productCode = '#' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const productId = name.toLowerCase().replace(/\s+/g, "-");
        
        const { error } = await supabase.from("products").insert({
          id: productId,
          name,
          base_price: parseFloat(basePrice),
          product_code: productCode,
          sizes: sizeObjects,
          constants: {
            CONSTANTE_VALOR_ALUGUEL_A: 3.72,
            CONSTANTE_VALOR_ALUGUEL_B: 1.89,
            REGRESSION_DISCOUNT: 0.0608,
            SPECIAL_RATES: {
              "7": 30,
              "10": 40,
              "15": 50,
              "30": 75
            }
          }
        });

        if (error) throw error;

        // Criar entradas no estoque para cada tamanho
        for (const size of sizes) {
          const { error: inventoryError } = await supabase
            .from("inventory")
            .insert({
              product_id: productId,
              size,
              total_quantity: 0,
              rented_quantity: 0,
            });

          if (inventoryError) throw inventoryError;
        }

        toast({
          title: "Sucesso",
          description: "Produto adicionado com sucesso",
        });
      }

      setIsOpen(false);
      setSelectedProduct(null);
      setName("");
      setBasePrice("");
      setSizes([]);
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: selectedProduct 
          ? "Erro ao atualizar produto"
          : "Erro ao adicionar produto",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      // Primeiro, excluir registros do inventário
      const { error: inventoryError } = await supabase
        .from("inventory")
        .delete()
        .eq("product_id", selectedProduct.id);

      if (inventoryError) throw inventoryError;

      // Depois, excluir o produto
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });

      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setSelectedProduct(null);
    setName("");
    setBasePrice("");
    setSizes([]);
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
