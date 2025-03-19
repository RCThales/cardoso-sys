import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CompanyHeader } from "./invoice/CompanyHeader";
import { ClientForm } from "./invoice/ClientForm";
import { InvoiceItems } from "./invoice/InvoiceItems";
import { useInvoiceGeneration } from "@/hooks/useInvoiceGeneration";
import { Input } from "./ui/input";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/utils/priceCalculator";
import { useNavigate } from "react-router-dom";
import Loader from "./loader";

interface InvoiceGeneratorProps {
  onInvoiceCreated?: () => void;
  onPaymentClick?: (total: number, invoiceRef: any) => void;
}

export const InvoiceGenerator = ({
  onInvoiceCreated,
  onPaymentClick,
}: InvoiceGeneratorProps) => {
  const navigate = useNavigate();
  const {
    items,
    setItems,
    clientData,
    setClientData,
    paymentMethod,
    setPaymentMethod,
    setInstallments,
    setSplitPayments,
    setNoInterest,
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
      const newItems = cartItems.map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId);
        return {
          productId: cartItem.productId,
          description: product?.name || "",
          quantity: cartItem.quantity,
          is_sale: cartItem.is_sale,
          rentalDays: cartItem.days,
          price: cartItem.total / cartItem.quantity,
          total: cartItem.total,
          size: cartItem.size || null,
        };
      });

      setItems(newItems);
    }
  }, [cartItems, setItems, products]);

  const formatCurrency = (
    value: number | string | null | undefined
  ): string => {
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

  const itemsSubtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const itemTotal = typeof item.total === "number" ? item.total : 0;
        return sum + itemTotal;
      }, 0),
    [items]
  );

  const itemSubTotalPlusShipping = () => {
    return itemsSubtotal + (clientData.deliveryFee || 0);
  };

  const calculateTotalItemsPlusShippingMinusDiscount = () => {
    return itemSubTotalPlusShipping() - clientData.specialDiscount;
  };

  const handleGenerateInvoice = async () => {
    if (!validateRequiredFields()) return;

    // If onPaymentClick is provided, use the payment dialog flow
    if (onPaymentClick) {
      const total = calculateTotalItemsPlusShippingMinusDiscount();
      
      // Set default payment method to "Não informado"
      setClientData({
        ...clientData,
        isPaid: false,
      });
      
      const invoiceRef = {
        generateInvoice,
        setPaymentMethod,
        setInstallments,
        setSplitPayments,
        setNoInterest
      };
      
      onPaymentClick(total, invoiceRef);
    } else {
      // Legacy flow without payment dialog
      setClientData({
        ...clientData,
        isPaid: false,
      });

      const invoiceCreated = await generateInvoice();
      clearCart();
      clearSessionStorage();

      navigate("/invoices/history?invoice_id=" + invoiceCreated);
      if (onInvoiceCreated) onInvoiceCreated();
    }
  };

  const clearSessionStorage = () => {
    sessionStorage.removeItem("clientData");
  };

  const handleBack = () => {
    navigate("/rentals");
  };

  const isFormValid = useMemo(
    () => validateRequiredFields(),
    [
      clientData.name,
      clientData.cpf,
      clientData.phone,
      clientData.postalCode,
      items.length,
    ]
  );

  if (!products) {
    return <Loader />;
  }

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
                type="number"
                id="deliveryFee"
                className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={clientData.deliveryFee || ""}
                onChange={(e) => handleDeliveryFeeChange(e.target.value)}
                placeholder="R$ 0,00"
                min={0}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <label className="font-medium" htmlFor="specialDiscount">
              Desconto Especial:
            </label>
            <div className="w-32">
              <Input
                type="number"
                id="specialDiscount"
                className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="R$ 0,00"
                min="0"
                max={itemSubTotalPlusShipping()}
                value={clientData.specialDiscount || ""}
                onChange={(e) => handleDiscountChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-medium text-lg">Total:</span>
            <span className="text-xl font-bold">
              R${" "}
              {formatCurrency(calculateTotalItemsPlusShippingMinusDiscount())}
            </span>
          </div>
        </div>

        <div className="md:flex flex-row justify-end gap-4 hidden">
          <Button variant="outline" onClick={handleBack}>
            Voltar
          </Button>
          <Button
            onClick={handleGenerateInvoice}
            className="w-full md:w-auto"
            disabled={!isFormValid}
          >
            Finalizar e Gerar Fatura
          </Button>
        </div>
        <div className="flex flex-col  justify-end gap-4 md:hidden">
          <Button
            onClick={handleGenerateInvoice}
            className="w-full md:w-auto"
            disabled={!isFormValid}
          >
            Finalizar e Gerar Fatura
          </Button>
          <Button variant="outline" onClick={handleBack}>
            Voltar
          </Button>
        </div>
      </div>
    </Card>
  );
};
