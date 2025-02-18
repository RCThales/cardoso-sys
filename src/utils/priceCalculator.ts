
import { supabase } from "@/integrations/supabase/client";

type ProductConstants = {
  CONSTANTE_VALOR_ALUGUEL_A: number;
  CONSTANTE_VALOR_ALUGUEL_B: number;
  REGRESSION_DISCOUNT: number;
  SPECIAL_RATES: Record<number, number>;
};

export async function fetchProducts() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;
  return data;
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

export const getProductConstants = (products: any[], productId: string) => {
  const product = products.find((p) => p.id === productId);
  return product?.constants;
};
