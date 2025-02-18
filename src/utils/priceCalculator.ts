
import { supabase } from "@/integrations/supabase/client";

export type ProductConstants = {
  CONSTANTE_VALOR_ALUGUEL_A: number;
  CONSTANTE_VALOR_ALUGUEL_B: number;
  REGRESSION_DISCOUNT: number;
  SPECIAL_RATES: Record<number, number>;
};

export interface ProductSize {
  size: string;
}

export interface Product {
  id: string;
  name: string;
  base_price: number;
  constants: ProductConstants;
  product_code: string;
  sizes?: ProductSize[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    sizes: item.sizes ? (item.sizes as ProductSize[]) : undefined,
    constants: item.constants as ProductConstants
  }));
}

export function calculateDailyRate(rentalDays: number, constants: ProductConstants) {
  console.log(Math.exp(-constants.REGRESSION_DISCOUNT * rentalDays));
  return (
    constants.CONSTANTE_VALOR_ALUGUEL_A *
      Math.exp(-constants.REGRESSION_DISCOUNT * rentalDays) +
    constants.CONSTANTE_VALOR_ALUGUEL_B
  );
}

export function roundToNearestHalf(value: number) {
  return Math.round(value * 2) / 2;
}

export function calculateTotalPrice(rentalDays: number, constants: ProductConstants) {
  const days = Math.max(1, Math.min(365, rentalDays));

  if (constants.SPECIAL_RATES[days] !== undefined) {
    return constants.SPECIAL_RATES[days];
  }

  const totalPrice = calculateDailyRate(days, constants) * days;
  return roundToNearestHalf(totalPrice);
}

export const getProductConstants = (products: Product[], productId: string): ProductConstants | undefined => {
  const product = products.find((p) => p.id === productId);
  return product?.constants;
};
