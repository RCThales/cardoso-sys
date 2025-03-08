import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/utils/priceCalculator";

interface ProductInput {
  name: string;
  basePrice: string;
  sizes: string[];
  salePrice: string;
}

const GenerateProductCode = () => {
  const productCode =
    "#" + Math.random().toString(36).substring(2, 8).toUpperCase();

  return productCode;
};

const GenerateProductId = (input) => {
  const productId = input.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return productId;
};

const uniqueProductCheck = async (productId, input) => {
  // Check if product with the same ID or Name already exists
  const { data: existingProduct, error: existingError } = await supabase
    .from("products")
    .select("id, name")
    .or(`id.eq.${productId},name.eq.${input.name}`)
    .maybeSingle();

  if (existingProduct) {
    const error = new Error(
      "A product with the same name or ID already exists."
    );
    error.name = "DuplicateProductError";
    throw error;
  }
};

export const productService = {
  async createProductWithoutSizes(input: ProductInput, quantity: string) {
    const productCode = GenerateProductCode();
    const productId = GenerateProductId(input);

    uniqueProductCheck(productId, input);

    const { data: insertedProducts, error: productError } = await supabase
      .from("products")
      .insert([
        {
          id: productId,
          name: input.name,
          base_price: parseFloat(input.basePrice),
          product_code: productCode,
          sizes: input.sizes.map((size) => ({ size })),
          sale_price: parseFloat(input.salePrice),
        },
      ])
      .select("id")
      .single();

    if (productError) throw productError;

    await this.updateInventoryWithoutSizes(productId, quantity);

    return insertedProducts;
  },

  async createProductWithSizes(
    input: ProductInput,
    quantities: Record<string, number>
  ) {
    const productCode = GenerateProductCode();
    const productId = GenerateProductId(input);

    uniqueProductCheck(productId, input);

    const { data: insertedProducts, error: productError } = await supabase
      .from("products")
      .insert([
        {
          id: productId,
          name: input.name,
          base_price: parseFloat(input.basePrice),
          product_code: productCode,
          sizes: input.sizes.map((size) => ({ size })),
          sale_price: parseFloat(input.salePrice),
        },
      ])
      .select("id")
      .single();

    if (productError) throw productError;

    await this.updateInventoryWithSizes(productId, input.sizes, quantities);

    return insertedProducts;
  },

  async updateProductWithoutSizes(
    productId: string,
    input: ProductInput,
    quantity: string
  ) {
    const { error: productError } = await supabase
      .from("products")
      .update({
        name: input.name,
        base_price: parseFloat(input.basePrice),
        sale_price: parseFloat(input.salePrice),
        sizes: input.sizes.map((size) => ({ size })),
      })
      .eq("id", productId);

    if (productError) throw productError;

    await this.updateInventoryWithoutSizes(productId, quantity);
  },

  async updateProductWithSizes(
    productId: string,
    input: ProductInput,
    quantities: Record<string, number>
  ) {
    const { error: productError } = await supabase
      .from("products")
      .update({
        name: input.name,
        base_price: parseFloat(input.basePrice),
        sale_price: parseFloat(input.salePrice),
        sizes: input.sizes.map((size) => ({ size })),
      })
      .eq("id", productId);

    if (productError) throw productError;

    await this.updateInventoryWithSizes(productId, input.sizes, quantities);
  },

  async updateInventoryWithoutSizes(productId: string, quantity: string) {
    const { error: deleteError } = await supabase
      .from("inventory")
      .delete()
      .eq("product_id", productId);

    if (deleteError) throw deleteError;

    const { error: inventoryError } = await supabase.from("inventory").upsert({
      product_id: productId,
      size: null,
      total_quantity: parseInt(quantity) || 0,
      rented_quantity: 0,
    });

    if (inventoryError) throw inventoryError;
  },

  async updateInventoryWithSizes(
    productId: string,
    sizes: string[],
    quantities: Record<string, number>
  ) {
    const { error: deleteError } = await supabase
      .from("inventory")
      .delete()
      .eq("product_id", productId);

    if (deleteError) throw deleteError;

    for (const size of sizes) {
      const totalQuantity = quantities[size] || 0;

      const { error: inventoryError } = await supabase
        .from("inventory")
        .upsert({
          product_id: productId,
          size,
          total_quantity: totalQuantity,
          rented_quantity: 0,
        });

      if (inventoryError) throw inventoryError;
    }
  },

  async getInventoryQuantityWithSizes(productId: string) {
    const { data: rawData, error } = await supabase
      .from("inventory")
      .select("size, total_quantity")
      .eq("product_id", productId);

    if (error) {
      console.error("Erro ao buscar inventário:", error);
      return {};
    }

    let inventoryData: Record<string, number> = {};

    rawData.forEach((element) => {
      inventoryData[element.size] = element.total_quantity;
    });

    return inventoryData;
  },

  async deleteProduct(productId: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    if (error) throw error;
  },
};
