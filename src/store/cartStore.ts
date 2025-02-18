
import { create } from "zustand";

export interface CartItem {
  productId: string;
  quantity: number;
  days: number;
  total: number;
  size?: string;
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
      const existingItem = state.items.find((i) => 
        i.productId === item.productId && i.size === item.size
      );
      
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId && i.size === item.size
              ? {
                  ...i,
                  quantity: item.quantity,
                  total: item.total,
                }
              : i
          ),
        };
      }
      
      return {
        items: [...state.items, item],
      };
    }),
  removeItem: (productId, size) =>
    set((state) => ({
      items: state.items.filter((item) => 
        !(item.productId === productId && item.size === size)
      ),
    })),
  clearCart: () => set({ items: [] }),
}));
