
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
    set((state) => {
      const existingItem = state.items.find((i) => i.productId === item.productId);
      
      if (existingItem) {
        // Se o item já existe, atualiza somando a quantidade
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? {
                  ...i,
                  quantity: i.quantity + item.quantity,
                  total: i.total + item.total,
                }
              : i
          ),
        };
      }
      
      // Se o item não existe, adiciona normalmente
      return {
        items: [...state.items, item],
      };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    })),
  clearCart: () => set({ items: [] }),
}));
