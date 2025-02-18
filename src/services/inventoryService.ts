
import { supabase } from "@/integrations/supabase/client";
import type { InvoiceItem } from "@/components/invoice/types";

export const updateInventory = async (items: InvoiceItem[]) => {
  for (const item of items) {
    if (item.productId === 'delivery-fee') continue;
    
    const query = supabase
      .from('inventory')
      .select('rented_quantity')
      .eq('product_id', item.productId);

    // Se houver tamanho, adiciona à query
    if (item.size) {
      query.eq('size', item.size);
    } else {
      query.is('size', null);
    }

    const { data: inventoryItem, error: fetchError } = await query.single();

    if (fetchError) {
      throw new Error(`Erro ao buscar item do estoque: ${item.productId}${item.size ? ` - ${item.size}` : ''}`);
    }

    const updateQuery = supabase
      .from('inventory')
      .update({ 
        rented_quantity: (inventoryItem?.rented_quantity || 0) + item.quantity 
      })
      .eq('product_id', item.productId);

    // Se houver tamanho, adiciona à query de atualização
    if (item.size) {
      updateQuery.eq('size', item.size);
    } else {
      updateQuery.is('size', null);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      throw new Error(`Erro ao atualizar estoque: ${item.productId}${item.size ? ` - ${item.size}` : ''}`);
    }
  }
};

export const returnToInventory = async (items: InvoiceItem[]) => {
  for (const item of items) {
    if (item.productId === 'delivery-fee') continue;
    
    const query = supabase
      .from('inventory')
      .select('rented_quantity')
      .eq('product_id', item.productId);

    // Se houver tamanho, adiciona à query
    if (item.size) {
      query.eq('size', item.size);
    } else {
      query.is('size', null);
    }

    const { data: inventoryItem, error: fetchError } = await query.single();

    if (fetchError) {
      throw new Error(`Erro ao buscar item do estoque: ${item.productId}${item.size ? ` - ${item.size}` : ''}`);
    }

    const updateQuery = supabase
      .from('inventory')
      .update({ 
        rented_quantity: Math.max(0, (inventoryItem?.rented_quantity || 0) - item.quantity)
      })
      .eq('product_id', item.productId);

    // Se houver tamanho, adiciona à query de atualização
    if (item.size) {
      updateQuery.eq('size', item.size);
    } else {
      updateQuery.is('size', null);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      throw new Error(`Erro ao atualizar estoque: ${item.productId}${item.size ? ` - ${item.size}` : ''}`);
    }
  }
};
