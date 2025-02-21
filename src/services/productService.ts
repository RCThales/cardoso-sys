
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/utils/priceCalculator";

interface ProductInput {
  name: string;
  basePrice: string;
  sizes: string[];
}

export const productService = {
  async createProduct(input: ProductInput, quantities: Record<string, number>) {
    const productCode = "#" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const productId = input.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { data: insertedProducts, error: productError } = await supabase
      .from("products")
      .insert([
        {
          id: productId,
          name: input.name,
          base_price: parseFloat(input.basePrice),
          product_code: productCode,
          sizes: input.sizes.map((size) => ({ size })),
        },
      ])
      .select("id")
      .single();

    if (productError) throw productError;

    await this.updateInventory(insertedProducts.id, input.sizes, quantities);
    return insertedProducts;
  },

  async updateProduct(productId: string, input: ProductInput, quantities: Record<string, number>) {
    const { error: productError } = await supabase
      .from("products")
      .update({
        name: input.name,
        base_price: parseFloat(input.basePrice),
        sizes: input.sizes.map((size) => ({ size })),
      })
      .eq("id", productId);

    if (productError) throw productError;

    await this.updateInventory(productId, input.sizes, quantities);
  },

  async deleteProduct(productId: string) {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) throw error;
  },

  async updateInventory(productId: string, sizes: string[], quantities: Record<string, number>) {
    const { error: deleteError } = await supabase
      .from("inventory")
      .delete()
      .eq("product_id", productId);

    if (deleteError) throw deleteError;

    if (sizes.length === 0) {
      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert({
          product_id: productId,
          size: null,
          total_quantity: 0,
          rented_quantity: 0,
        });

      if (inventoryError) throw inventoryError;
    } else {
      for (const size of sizes) {
        const totalQuantity = quantities[size] || 0;

        const { error: inventoryError } = await supabase
          .from("inventory")
          .insert({
            product_id: productId,
            size,
            total_quantity: totalQuantity,
            rented_quantity: 0,
          });

        if (inventoryError) throw inventoryError;
      }
    }
  },
};
