import { supabase } from "@/integrations/supabase/client";
import type { InvoiceItem } from "@/components/invoice/types";

// Função para buscar o item no inventário
const getInventoryItem = async (productId: string, size: string | null) => {
  const query = supabase
    .from("inventory")
    .select("*")
    .eq("product_id", productId);

  if (size) {
    query.eq("size", size);
  } else {
    query.is("size", null);
  }

  const { data, error } = await query.single();
  if (error) {
    throw new Error(
      `Erro ao buscar item do estoque: ${productId}${size ? ` - ${size}` : ""}`
    );
  }
  return data;
};

// Função para atualizar o estoque
const updateInventoryItem = async (
  productId: string,
  size: string | null,
  rentedQuantity: number,
  totalQuantity: number
) => {
  const updateQuery = supabase
    .from("inventory")
    .update({
      rented_quantity: rentedQuantity,
      total_quantity: totalQuantity,
    })
    .eq("product_id", productId);

  if (size) {
    updateQuery.eq("size", size);
  } else {
    updateQuery.is("size", null);
  }

  const { error } = await updateQuery;
  if (error) {
    throw new Error(
      `Erro ao atualizar estoque: ${productId}${size ? ` - ${size}` : ""}`
    );
  }
};

// Função principal para atualizar o inventário
export const updateInventory = async (items: InvoiceItem[]) => {
  for (const item of items) {
    // Ignorar taxa de entrega
    if (item.productId === "delivery-fee") continue;

    console.log(`Processando item: ${item.description} ${item.size || ""}`);

    try {
      const inventoryItem = await getInventoryItem(item.productId, item.size);

      // Calcular a nova quantidade com base no is_sale
      if (item.is_sale) {
        // Se for uma venda:
        // - Decrementa da quantidade total
        // - Decrementa da quantidade disponível (total_quantity - rented_quantity)
        // - Incrementa a quantidade alugada
        const newTotalQuantity = inventoryItem.total_quantity - item.quantity;

        console.log(
          `Atualizando estoque para venda. Nova quantidade total: ${newTotalQuantity}`
        );
        await updateInventoryItem(
          item.productId,
          item.size,
          inventoryItem.rented_quantity,
          newTotalQuantity
        );
      } else {
        // Se for apenas aluguel, só atualiza a quantidade alugada
        const newRentedQuantity = inventoryItem.rented_quantity + item.quantity;

        console.log(
          `Atualizando estoque para aluguel. Nova quantidade alugada: ${newRentedQuantity}`
        );
        await updateInventoryItem(
          item.productId,
          item.size,
          newRentedQuantity,
          inventoryItem.total_quantity
        );
      }

      console.log(
        `Estoque atualizado com sucesso para: ${item.description} ${
          item.size || ""
        }`
      );
    } catch (error) {
      console.error("Erro ao processar item:", error);
    }
  }
};

export const returnToInventory = async (items: InvoiceItem[]) => {
  for (const item of items) {
    if (item.productId === "delivery-fee") continue;

    const query = supabase
      .from("inventory")
      .select("*")
      .eq("product_id", item.productId);

    // Se houver tamanho, adiciona à query
    if (item.size) {
      query.eq("size", item.size);
    } else {
      query.is("size", null);
    }

    const { data: inventoryItem, error: fetchError } = await query.single();

    if (fetchError) {
      throw new Error(
        `Erro ao buscar item do estoque: ${item.productId}${
          item.size ? ` - ${item.size}` : ""
        }`
      );
    }

    // Verifica a quantidade disponível e ajusta a quantidade alugada
    const availableQuantity =
      inventoryItem.total_quantity - inventoryItem.rented_quantity;
    if (item.quantity > availableQuantity) {
      throw new Error(
        `Quantidade solicitada para o produto ${item.productId}${
          item.size ? ` - ${item.size}` : ""
        } excede a quantidade disponível em estoque.`
      );
    }

    const newRentedQuantity = Math.max(
      0,
      (inventoryItem?.rented_quantity || 0) - item.quantity
    );

    const updateQuery = supabase
      .from("inventory")
      .update({
        rented_quantity: newRentedQuantity,
      })
      .eq("product_id", item.productId);

    // Se houver tamanho, adiciona à query de atualização
    if (item.size) {
      updateQuery.eq("size", item.size);
    } else {
      updateQuery.is("size", null);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      throw new Error(
        `Erro ao atualizar estoque: ${item.productId}${
          item.size ? ` - ${item.size}` : ""
        }`
      );
    }
  }
};
