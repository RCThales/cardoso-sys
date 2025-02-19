import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAvailableQuantity = (
  inventory: any[],
  productId: string,
  size?: string
) => {
  const item = inventory?.find((i) => {
    if (size) {
      return i.product_id === productId && i.size === size;
    } else {
      return i.product_id === productId && i.size === null;
    }
  });
  return item ? item.total_quantity - item.rented_quantity : 0;
};

export const calculateTotalPrice = (
  basePrice: number,
  rentalDays: number,
  discountRate: number = 0
): number => {
  if (rentalDays <= 0) return 0;

  const totalPrice = basePrice * rentalDays;
  const discount = totalPrice * discountRate;

  return totalPrice - discount;
};
