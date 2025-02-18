
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CompanyHeader } from "./invoice/CompanyHeader";
import { ClientForm } from "./invoice/ClientForm";
import { InvoiceItems } from "./invoice/InvoiceItems";
import { useInvoiceGeneration } from "@/hooks/useInvoiceGeneration";
import { Input } from "./ui/input";
import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/utils/priceCalculator";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const InvoiceGenerator = () => {
  const navigate = useNavigate();
  const {
    items,
    clientData,
    setClientData,
    addItem,
    updateItem,
    removeItem,
    calculateSubtotal,
    generateInvoice,
    validateRequiredFields,
  } = useInvoiceGeneration();

  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    if (products) {
      const newItems = cartItems.map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        return {
          productId: cartItem.productId,
          description: product?.name || "",
          quantity: cartItem.quantity,
          rentalDays: cartItem.days,
          price: cartItem.total / cartItem.quantity,
          total: cartItem.total
        };
      });
      
      setItems(newItems);
    }
  }, [cartItems, setItems, products]);

  const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  const handleDeliveryFeeChange = (value: string) => {
    setClientData({
      ...clientData,
      deliveryFee: Number(value) || 0,
    });
  };

  const handleDiscountChange = (value: string) => {
    setClientData({
      ...clientData,
      specialDiscount: Number(value) || 0,
    });
  };

  const itemsSubtotal = items.reduce((sum, item) => {
    const itemTotal = typeof item.total === 'number' ? item.total : 0;
    return sum + itemTotal;
  }, 0);

  const calculateTotal = () => {
    const subtotal = itemsSubtotal + (clientData.deliveryFee || 0);
    const discount = (subtotal * clientData.specialDiscount) / 100;
    return subtotal - discount;
  };

  const handleGenerateInvoice = async () => {
    if (!validateRequiredFields()) return;
    await generateInvoice();
    clearCart();
    navigate("/invoices");
  };

  const handleBack = () => {
    navigate("/calc");
  };

  const discountOptions = Array.from({ length: 21 }, (_, i) => i * 5);

  if (!products) {
    return <div>Carregando...</div>;
  }

  // Now we get the validation result only when needed, not on every render
  const isValid = () => validateRequiredFields();

  return (
    <Card className="p-6">
      <CompanyHeader />

      <div className="space-y-6">
        <ClientForm
          clientData={clientData}
          onClientDataChange={setClientData}
        />

        <InvoiceItems
          items={items}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          readOnly
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Subtotal:</span>
            <span>R$ {formatCurrency(itemsSubtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <label className="font-medium" htmlFor="deliveryFee">
              Frete:
            </label>
            <div className="w-32">
              <Input
                id="deliveryFee"
                type="number"
                value={clientData.deliveryFee}
                onChange={(e) => handleDeliveryFeeChange(e.target.value)}
                min={0}
                step="0.01"
                className="text-right"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <label className="font-medium" htmlFor="specialDiscount">
              Desconto Especial:
            </label>
            <div className="w-32">
              <Select
                value={String(clientData.specialDiscount)}
                onValueChange={handleDiscountChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o desconto" />
                </SelectTrigger>
                <SelectContent>
                  {discountOptions.map((discount) => (
                    <SelectItem key={discount} value={String(discount)}>
                      {discount}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-medium text-lg">Total:</span>
            <span className="text-xl font-bold">
              R$ {formatCurrency(calculateTotal())}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleBack}>
            Voltar
          </Button>
          <Button 
            onClick={handleGenerateInvoice} 
            className="w-full md:w-auto"
            disabled={!isValid()}
          >
            Gerar Fatura e Finalizar
          </Button>
        </div>
      </div>
    </Card>
  );
};
