import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/utils/priceCalculator";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";

const Products = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
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
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        // Editar produto existente
        const { error } = await supabase
          .from("products")
          .update({
            name,
            base_price: parseFloat(basePrice),
          })
          .eq("id", selectedProduct.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso",
        });
      } else {
        // Criar novo produto
        const productCode = '#' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error } = await supabase.from("products").insert({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name,
          base_price: parseFloat(basePrice),
          product_code: productCode,
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

        toast({
          title: "Sucesso",
          description: "Produto adicionado com sucesso",
        });
      }

      setIsOpen(false);
      setSelectedProduct(null);
      setName("");
      setBasePrice("");
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

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            className="pl-10"
            placeholder="Buscar por nome ou código do produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-muted-foreground">
                    Valor base: R$ {product.base_price.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground">
                    Código: {product.product_code}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-500 hover:text-blue-500 hover:bg-blue-50"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Produto</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Base</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                {selectedProduct ? "Atualizar Produto" : "Adicionar Produto"}
              </Button>
            </form>
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
