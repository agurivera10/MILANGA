export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          business_id: string
          name: string
          category: string | null
          base_unit: string
          presentation_unit: string
          presentation_quantity: number
          preferred_supplier_id: string | null
          current_price: number
          expected_yield: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          category?: string | null
          base_unit: string
          presentation_unit: string
          presentation_quantity: number
          preferred_supplier_id?: string | null
          current_price?: number
          expected_yield?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          category?: string | null
          base_unit?: string
          presentation_unit?: string
          presentation_quantity?: number
          preferred_supplier_id?: string | null
          current_price?: number
          expected_yield?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // TODO: Añadir el resto de las tablas (suppliers, recipes, products, etc.) a medida que las consumamos
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
