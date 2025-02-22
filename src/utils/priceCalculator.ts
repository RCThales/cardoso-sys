import { supabase } from "@/integrations/supabase/client";

export interface ProductSize {
  size: string;
}

export interface Product {
  id: string;
  name: string;
  base_price: number;
  sale_price: number;
  product_code: string;
  sizes?: ProductSize[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;

  return data.map((item) => ({
    ...item,
    sizes: item.sizes ? (item.sizes as unknown as ProductSize[]) : undefined,
    base_price: item.base_price,
    sale_price: item.sale_price,
  }));
}

export function calculateDailyRate(
  rentalDays: number,
  base_price: number // Preço base de 1 dia de aluguel
) {
  const initialPrice = base_price; // Valor inicial (ex: R$ 6,00)
  const discountRate = 0.09; // Taxa de desconto exponencial (10% por dia)

  // Calcula o valor diário com desconto exponencial
  const dailyRate = initialPrice * Math.pow(1 - discountRate, rentalDays - 1);

  // Garante que o valor diário não seja menor que um limite mínimo (ex: 10% do BASE_PRICE)
  const minDailyRate = initialPrice * 0.26; // Limite mínimo de 10% do preço base
  return Math.max(dailyRate, minDailyRate);
}

export function roundToNearestHalf(value: number) {
  return Math.round(value * 5) / 5;
}

export function calculateTotalPrice(
  rentalDays: number,
  base_price: number // Preço base de 1 dia de aluguel
) {
  let totalPrice = 0;

  // Calcula o valor total somando o valor diário com desconto progressivo
  for (let day = 1; day <= rentalDays; day++) {
    totalPrice += calculateDailyRate(day, base_price);
  }

  // Verifica se o número de dias está na lista de dias especiais
  const specialDays = [5, 7, 10, 15, 20, 30, 60];
  if (specialDays.includes(rentalDays)) {
    // Arredonda para o próximo número que termina com 0 ou 5
    return Math.round(totalPrice / 5) * 5;
  }

  // Caso contrário, arredonda para o múltiplo de 0.50 mais próximo
  const roundedTotalPrice = Math.round(totalPrice * 2) / 2;

  return roundedTotalPrice;
}

export const getProductBasePrice = (
  products: Product[],
  productId: string
): number | undefined => {
  const product = products.find((p) => p.id === productId);
  return product?.base_price;
};
