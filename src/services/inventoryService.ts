
import { supabase } from "@/integrations/supabase/client";
import type { InvoiceItem } from "@/components/invoice/types";

export const updateInventory = async (items: InvoiceItem[]) => {
  for (const item of items) {
    if (item.productId === 'delivery-fee') continue;
    
    const { data: inventoryItem, error: fetchError } = await supabase
      .from('inventory')
      .select('rented_quantity')
      .eq('product_id', item.productId)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar item do estoque: ${item.productId}`);
    }

    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        rented_quantity: (inventoryItem?.rented_quantity || 0) + item.quantity 
      })
      .eq('product_id', item.productId);

    if (updateError) {
      throw new Error(`Erro ao atualizar estoque: ${item.productId}`);
    }
  }
};

export const returnToInventory = async (items: InvoiceItem[]) => {
  for (const item of items) {
    if (item.productId === 'delivery-fee') continue;
    
    const { data: inventoryItem, error: fetchError } = await supabase
      .from('inventory')
      .select('rented_quantity')
      .eq('product_id', item.productId)
      .single();

    if (fetchError) {
      throw new Error(`Erro ao buscar item do estoque: ${item.productId}`);
    }

    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        rented_quantity: Math.max(0, (inventoryItem?.rented_quantity || 0) - item.quantity)
      })
      .eq('product_id', item.productId);

    if (updateError) {
      throw new Error(`Erro ao atualizar estoque: ${item.productId}`);
    }
  }
};
