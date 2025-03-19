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
      communications: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string | null
          from_email: string
          from_name: string
          id: string
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_secure: boolean
          smtp_user: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_email: string
          from_name: string
          id?: string
          smtp_host: string
          smtp_password: string
          smtp_port?: number
          smtp_secure?: boolean
          smtp_user: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_email?: string
          from_name?: string
          id?: string
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_secure?: boolean
          smtp_user?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      franchises: {
        Row: {
          address: string
          city: string
          contact_person: string
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          name: string
          phone: string
          province: string
          tesis_code: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          city: string
          contact_person: string
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          name: string
          phone: string
          province: string
          tesis_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          city?: string
          contact_person?: string
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          province?: string
          tesis_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      lead_details: {
        Row: {
          additional_comments: string
          created_at: string | null
          id: string
          interest_level: number
          investment_capacity: string
          lead_id: string
          previous_experience: string
          score: number
          source_channel: string
          updated_at: string | null
        }
        Insert: {
          additional_comments?: string
          created_at?: string | null
          id?: string
          interest_level?: number
          investment_capacity?: string
          lead_id: string
          previous_experience?: string
          score?: number
          source_channel?: string
          updated_at?: string | null
        }
        Update: {
          additional_comments?: string
          created_at?: string | null
          id?: string
          interest_level?: number
          investment_capacity?: string
          lead_id?: string
          previous_experience?: string
          score?: number
          source_channel?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_details_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_status_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          notes: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          location: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          location: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          location?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_modify_communication: {
        Args: {
          communication_id: string
        }
        Returns: boolean
      }
      can_modify_lead: {
        Args: {
          lead_id: string
        }
        Returns: boolean
      }
      can_modify_task: {
        Args: {
          task_id: string
        }
        Returns: boolean
      }
      check_user_permission: {
        Args: {
          permission_name: string
        }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
