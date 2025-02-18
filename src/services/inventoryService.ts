
import { supabase } from "@/integrations/supabase/client";
import type { InvoiceItem } from "@/components/invoice/types";

export const updateInventory = async (items: InvoiceItem[]) => {
  console.log("Atualizando inventário com items:", items);
  
  for (const item of items) {
    if (item.productId === 'delivery-fee') continue;
    
    console.log(`Processando item: ${item.description} ${item.size || ''}`);
    
    const query = supabase
      .from('inventory')
      .select('*')
      .eq('product_id', item.productId);

    // Se houver tamanho, adiciona à query
    if (item.size) {
      query.eq('size', item.size);
    } else {
      query.is('size', null);
    }

    const { data: inventoryItem, error: fetchError } = await query.single();

    if (fetchError) {
      console.error("Erro ao buscar item:", fetchError);
      throw new Error(`Erro ao buscar item do estoque: ${item.productId}${item.size ? ` - ${item.size}` : ''}`);
    }

    console.log("Item encontrado no inventário:", inventoryItem);

    const newRentedQuantity = (inventoryItem?.rented_quantity || 0) + item.quantity;
    console.log(`Nova quantidade alugada: ${newRentedQuantity}`);

    const updateQuery = supabase
      .from('inventory')
      .update({ 
        rented_quantity: newRentedQuantity
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
      console.error("Erro ao atualizar item:", updateError);
      throw new Error(`Erro ao atualizar estoque: ${item.productId}${item.size ? ` - ${item.size}` : ''}`);
    }

    console.log(`Estoque atualizado com sucesso para: ${item.description} ${item.size || ''}`);
  }
};

export const returnToInventory = async (items: InvoiceItem[]) => {
  for (const item of items) {
    if (item.productId === 'delivery-fee') continue;
    
    const query = supabase
      .from('inventory')
      .select('*')
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

    const newRentedQuantity = Math.max(0, (inventoryItem?.rented_quantity || 0) - item.quantity);

    const updateQuery = supabase
      .from('inventory')
      .update({ 
        rented_quantity: newRentedQuantity
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
