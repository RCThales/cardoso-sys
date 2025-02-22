import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/utils/priceCalculator";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Sales = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { clearCart } = useCartStore();

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products", search],
    queryFn: () => fetchProducts(search),
  });

  const handleCreateSale = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    const cartItems = useCartStore.getState().items;
    if (cartItems.length === 0) {
      toast({
        title: "Erro",
        description: "O carrinho está vazio.",
        variant: "destructive",
      });
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([
          {
            invoice_number: `SALE-${Date.now()}`,
            client_name: 'Venda Avulsa',
            client_cpf: '000.000.000-00',
            client_phone: 'Não informado',
            total: total,
            is_paid: true,
            is_returned: false,
            client_address: 'Não informado',
            client_address_number: 'Não informado',
            client_address_complement: 'Não informado',
            client_city: 'Não informado',
            client_state: 'Não informado',
            client_postal_code: 'Não informado',
            items: cartItems,
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: new Date().toISOString().split('T')[0],
            payment_method: 'Dinheiro',
            user_id: session.user.id,
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }

      clearCart();
      toast({
        title: "Sucesso",
        description: "Venda criada com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao criar venda: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Página de Vendas</h1>
          <Button onClick={() => setIsCartOpen(true)}>
            Carrinho ({useCartStore.getState().items.length})
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <p>Carregando produtos...</p>
        ) : isError ? (
          <p>Erro ao carregar produtos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products?.map((product) => (
              <div key={product.id} className="border rounded-md p-4">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600">R$ {product.price}</p>
                <Button onClick={() => useCartStore.getState().addItem(product)}>
                  Adicionar ao carrinho
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleCreateSale} className="mt-4">
          Finalizar Venda
        </Button>

        <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
      </div>
    </div>
  );
};

export default Sales;
