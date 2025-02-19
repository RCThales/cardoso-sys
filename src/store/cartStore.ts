import { create } from "zustand";
import { calculateTotalPrice } from "@/utils/priceCalculator";

export interface CartItem {
  productId: string;
  quantity: number;
  days: number;
  total: number;
  size?: string;
  base_price: number; // Certifique-se de que as constantes estão presentes
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

      console.log(item);
      // Verifica se as constantes estão presentes
      if (!item.base_price) {
        console.error("Base Price is missing for the product:", item.productId);
        return { items: state.items }; // Retorna o estado atual sem modificar
      }

      // Se o item existir, atualiza a quantidade, dias e recalcula o total
      if (existingItem) {
        const updatedItem = { ...existingItem };

        let updated = false;

        if (existingItem.quantity !== item.quantity) {
          updatedItem.quantity = item.quantity; // Atualiza a quantidade
          updated = true;
        }

        if (existingItem.days !== item.days) {
          updatedItem.days = item.days; // Atualiza os dias
          updated = true;
        }

        // Recalcula o total com base na nova quantidade e dias
        if (updated) {
          const totalPricePerUnit = calculateTotalPrice(
            updatedItem.days,
            updatedItem.base_price
          );
          updatedItem.total = totalPricePerUnit * updatedItem.quantity;

          return {
            items: state.items.map((i) =>
              i.productId === item.productId && i.size === item.size
                ? updatedItem
                : i
            ),
          };
        }

        // Se não houver alterações, retorna o estado atual
        return { items: state.items };
      }

      // Se o item não existir, adiciona um novo item
      const totalPricePerUnit = calculateTotalPrice(item.days, item.base_price);
      const newItem = {
        ...item,
        total: totalPricePerUnit * item.quantity, // Calcula o total inicial
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
