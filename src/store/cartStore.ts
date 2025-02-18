
import { create } from "zustand";

export interface CartItem {
  productId: string;
  quantity: number;
  days: number;
  total: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items.filter((i) => i.productId !== item.productId), item],
    })),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    })),
  clearCart: () => set({ items: [] }),
}));
