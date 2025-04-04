export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          amount: number | null
          created_at: string | null
          date: string | null
          description: string | null
          id: number
          installments: number | null
          name: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: never
          installments?: number | null
          name?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: never
          installments?: number | null
          name?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: number
          product_id: string
          rented_quantity: number
          size: string | null
          total_quantity: number
        }
        Insert: {
          id?: number
          product_id: string
          rented_quantity?: number
          size?: string | null
          total_quantity?: number
        }
        Update: {
          id?: number
          product_id?: string
          rented_quantity?: number
          size?: string | null
          total_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          description: string | null
          id: number
          installments: number | null
          name: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          description?: string | null
          id?: number
          installments?: number | null
          name: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          description?: string | null
          id?: number
          installments?: number | null
          name?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_address: string
          client_address_complement: string | null
          client_address_number: string | null
          client_city: string
          client_cpf: string
          client_name: string
          client_neighborhood: string | null
          client_phone: string
          client_postal_code: string
          client_state: string
          created_at: string | null
          due_date: string
          extensions: Json[] | null
          id: number
          installments: number | null
          invoice_date: string
          invoice_number: string
          is_paid: boolean
          is_returned: boolean
          items: Json
          notes: string | null
          payment_method: string | null
          payment_terms: string | null
          subtotal: number
          total: number
          user_id: string
        }
        Insert: {
          client_address: string
          client_address_complement?: string | null
          client_address_number?: string | null
          client_city: string
          client_cpf: string
          client_name: string
          client_neighborhood?: string | null
          client_phone: string
          client_postal_code: string
          client_state: string
          created_at?: string | null
          due_date: string
          extensions?: Json[] | null
          id?: number
          installments?: number | null
          invoice_date: string
          invoice_number: string
          is_paid?: boolean
          is_returned?: boolean
          items: Json
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          subtotal: number
          total: number
          user_id: string
        }
        Update: {
          client_address?: string
          client_address_complement?: string | null
          client_address_number?: string | null
          client_city?: string
          client_cpf?: string
          client_name?: string
          client_neighborhood?: string | null
          client_phone?: string
          client_postal_code?: string
          client_state?: string
          created_at?: string | null
          due_date?: string
          extensions?: Json[] | null
          id?: number
          installments?: number | null
          invoice_date?: string
          invoice_number?: string
          is_paid?: boolean
          is_returned?: boolean
          items?: Json
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          subtotal?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          base_price: number
          id: string
          name: string
          product_code: string
          sale_price: number
          sizes: Json | null
        }
        Insert: {
          base_price: number
          id: string
          name: string
          product_code: string
          sale_price?: number
          sizes?: Json | null
        }
        Update: {
          base_price?: number
          id?: string
          name?: string
          product_code?: string
          sale_price?: number
          sizes?: Json | null
        }
        Relationships: []
      }
      recurring: {
        Row: {
          amount: number | null
          created_at: string
          date: string | null
          description: string | null
          id: number
          name: string | null
          recurring_cancellation_date: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: number
          name?: string | null
          recurring_cancellation_date?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: number
          name?: string | null
          recurring_cancellation_date?: string | null
        }
        Relationships: []
      }
      settings_pagamentos: {
        Row: {
          fee: number | null
          id: number
          installments: Json | null
          name: string | null
        }
        Insert: {
          fee?: number | null
          id?: never
          installments?: Json | null
          name?: string | null
        }
        Update: {
          fee?: number | null
          id?: never
          installments?: Json | null
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
