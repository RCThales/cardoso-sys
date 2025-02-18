
export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
  productId: string;
  rentalDays: number;
}

export interface InvoiceExtension {
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
  client_city: string;
  client_state: string;
  client_postal_code: string;
  items: InvoiceItem[];
  invoice_date: string;
  due_date: string;
  payment_method?: string;
  extensions?: InvoiceExtension[];
  user_id?: string;
}

// Helper type for Supabase JSON conversion
export type DatabaseInvoice = Omit<Invoice, 'extensions'> & {
  extensions: InvoiceExtension[] | null;
};

// Converter function
export const convertDatabaseInvoice = (dbInvoice: any): Invoice => {
  return {
    ...dbInvoice,
    extensions: dbInvoice.extensions ? JSON.parse(JSON.stringify(dbInvoice.extensions)) : undefined,
    items: Array.isArray(dbInvoice.items) ? dbInvoice.items : JSON.parse(dbInvoice.items || '[]'),
  };
};
