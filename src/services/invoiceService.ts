import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import type { InvoiceItem } from "@/components/invoice/types";
import type { ClientData } from "@/types/invoice";

// Helper function to update client information
const updateClientInfoIfNeeded = async (clientData: ClientData) => {
  // Check if client with same CPF exists
  const { data: existingInvoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("client_cpf", clientData.cpf)
    .limit(1);

  // If client exists, update all their invoices with the new information
  if (existingInvoices && existingInvoices.length > 0) {
    await supabase
      .from("invoices")
      .update({
        client_name: clientData.name,
        client_phone: clientData.phone,
        client_address: clientData.address,
        client_address_number: clientData.addressNumber,
        client_address_complement: clientData.addressComplement,
        client_neighborhood: clientData.neighborhood, // Added neighborhood field
        client_city: clientData.city,
        client_state: clientData.state,
        client_postal_code: clientData.postalCode,
      })
      .eq("client_cpf", clientData.cpf);
  }
};

export const createInvoice = async (
  items: InvoiceItem[],
  clientData: ClientData,
  total: number,
  userId: string,
  paymentFee: number = 0,
  startDate?: Date
) => {
  // First update client information if needed
  await updateClientInfoIfNeeded(clientData);

  const invoiceNumber = `INV-${Date.now()}`;
  const today = startDate || new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 30);

  // The installments is now stored as a percentage in the database
  // The total should already include the calculated fee amount

  const allItems = [
    ...items.map((item) => ({
      ...item,
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      total: Number(item.total) || 0,
    })),
    {
      description: "Frete",
      quantity: 1,
      price: clientData.deliveryFee,
      total: clientData.deliveryFee,
      productId: "delivery-fee",
      rentalDays: 1,
    },
  ] as Json;

  const { error } = await supabase.from("invoices").insert({
    invoice_number: invoiceNumber,
    client_name: clientData.name,
    client_cpf: clientData.cpf,
    client_phone: clientData.phone,
    client_address: clientData.address,
    client_address_number: clientData.addressNumber,
    client_address_complement: clientData.addressComplement,
    client_neighborhood: clientData.neighborhood,
    client_city: clientData.city,
    client_state: clientData.state,
    client_postal_code: clientData.postalCode,
    invoice_date: format(today, "yyyy-MM-dd"),
    due_date: format(dueDate, "yyyy-MM-dd"),
    payment_terms: "30 dias",
    items: allItems,
    subtotal: total,
    total: total,
    is_paid: clientData.isPaid,
    payment_method: "Não informado",
    installments: paymentFee > 0 ? paymentFee : null, // Store as percentage
    user_id: userId,
  });

  if (error) throw error;

  return invoiceNumber;
};
