
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Product } from "@/utils/priceCalculator";

const Products = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const { toast } = useToast();

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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

      setIsOpen(false);
      setName("");
      setBasePrice("");
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto",
        variant: "destructive",
      });
    }
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Card key={product.id} className="p-6">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-muted-foreground">
                Valor base: R$ {product.base_price.toFixed(2)}
              </p>
              <p className="text-muted-foreground">
                Código: {product.product_code}
              </p>
            </Card>
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
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
                Adicionar Produto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Products;
