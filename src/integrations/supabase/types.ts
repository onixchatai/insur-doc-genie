export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      inventory_items: {
        Row: {
          brand: string | null
          category: string | null
          color: string | null
          condition: string | null
          created_at: string
          description: string | null
          estimated_value: number | null
          id: string
          image_url: string | null
          model: string | null
          name: string
          purchase_date: string | null
          purchase_price: number | null
          room_location: string | null
          serial_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          image_url?: string | null
          model?: string | null
          name: string
          purchase_date?: string | null
          purchase_price?: number | null
          room_location?: string | null
          serial_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          image_url?: string | null
          model?: string | null
          name?: string
          purchase_date?: string | null
          purchase_price?: number | null
          room_location?: string | null
          serial_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_jobs: {
        Row: {
          assigned_to: string | null
          claim_number: string | null
          client_address: string | null
          client_name: string
          created_at: string
          created_by: string
          due_date: string | null
          id: string
          job_name: string
          job_status: string | null
          notes: string | null
          policy_number: string | null
          priority: string | null
          supervisor: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          claim_number?: string | null
          client_address?: string | null
          client_name: string
          created_at?: string
          created_by: string
          due_date?: string | null
          id?: string
          job_name: string
          job_status?: string | null
          notes?: string | null
          policy_number?: string | null
          priority?: string | null
          supervisor?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          claim_number?: string | null
          client_address?: string | null
          client_name?: string
          created_at?: string
          created_by?: string
          due_date?: string | null
          id?: string
          job_name?: string
          job_status?: string | null
          notes?: string | null
          policy_number?: string | null
          priority?: string | null
          supervisor?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_address: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          iicrc_certification_number: string | null
          license_number: string | null
        }
        Insert: {
          company_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          iicrc_certification_number?: string | null
          license_number?: string | null
        }
        Update: {
          company_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          iicrc_certification_number?: string | null
          license_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const
