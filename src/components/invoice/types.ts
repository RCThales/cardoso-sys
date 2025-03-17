
export interface InvoiceItem {
  is_sale: any;
  description: string;
  quantity: number;
  price: number;
  total: number;
  productId: string;
  rentalDays: number;
  size?: string;
}

export interface InvoiceExtension {
  [key: string]: string | number;
  date: string;
  days: number;
  additionalCost: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  created_at: string;
  client_name: string;
  client_cpf: string;
  client_phone: string;
  total: number;
  is_paid: boolean;
  is_returned: boolean;
  client_address: string;
  client_address_number: string;
  client_address_complement: string;
  client_neighborhood: string; // Added neighborhood field
  client_city: string;
  client_state: string;
  client_postal_code: string;
  items: InvoiceItem[];
  invoice_date: string;
  due_date: string;
  payment_method?: string;
  extensions?: InvoiceExtension[];
  user_id?: string;
  return_date?: string;
  notes?: string | null;
}

// Helper type for Supabase JSON conversion
export type DatabaseInvoice = Omit<Invoice, "extensions"> & {
  extensions: InvoiceExtension[] | null;
};

// Converter function
export const convertDatabaseInvoice = (dbInvoice: any): Invoice => {
  const invoice = {
    ...dbInvoice,
    extensions: dbInvoice.extensions
      ? JSON.parse(JSON.stringify(dbInvoice.extensions))
      : undefined,
    items: Array.isArray(dbInvoice.items)
      ? dbInvoice.items
      : JSON.parse(dbInvoice.items || "[]"),
  };

  // Calcular a data de devolução com base na data inicial e dias alugados
  const initialDate = new Date(invoice.invoice_date);
  const totalDays =
    invoice.items.reduce((max, item) => Math.max(max, item.rentalDays), 0) +
    (invoice.extensions?.reduce((sum, ext) => sum + ext.days, 0) || 0);

  initialDate.setDate(initialDate.getDate() + totalDays);
  invoice.return_date = initialDate.toISOString().split("T")[0];

  return invoice;
};
