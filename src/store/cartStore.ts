
import { create } from "zustand";
import { calculateTotalPrice } from "@/utils/priceCalculator";

export interface CartItem {
  productId: string;
  quantity: number;
  days: number;
  total: number;
  size?: string;
  base_price: number;
  is_sale?: boolean;
  sale_price?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.productId === item.productId && i.size === item.size
      );

      // Se o item existir, atualiza a quantidade, dias e recalcula o total
      if (existingItem) {
        const updatedItem = { ...existingItem };

        let updated = false;

        if (existingItem.quantity !== item.quantity) {
          updatedItem.quantity = item.quantity;
          updated = true;
        }

        if (existingItem.days !== item.days) {
          updatedItem.days = item.days;
          updated = true;
        }

        if (updated) {
          if (item.is_sale) {
            updatedItem.total = (item.sale_price || 0) * updatedItem.quantity;
          } else {
            const totalPricePerUnit = calculateTotalPrice(
              updatedItem.days,
              updatedItem.base_price
            );
            updatedItem.total = totalPricePerUnit * updatedItem.quantity;
          }

          return {
            items: state.items.map((i) =>
              i.productId === item.productId && i.size === item.size
                ? updatedItem
                : i
            ),
          };
        }

        return { items: state.items };
      }

      // Se o item não existir, adiciona um novo item
      const newItem = {
        ...item,
        total: item.is_sale
          ? (item.sale_price || 0) * item.quantity
          : calculateTotalPrice(item.days, item.base_price) * item.quantity,
      };

      return {
        items: [...state.items, newItem],
      };
    }),
  removeItem: (productId, size) =>
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.productId === productId && item.size === size)
      ),
    })),
  clearCart: () => set({ items: [] }),
}));
