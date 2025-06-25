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
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          last_used_at: string | null
          name: string
          service: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          last_used_at?: string | null
          name: string
          service: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          last_used_at?: string | null
          name?: string
          service?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      backup_jobs: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          progress: number | null
          status: string
          user_id: string
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          progress?: number | null
          status: string
          user_id: string
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          progress?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      execution_logs: {
        Row: {
          id: string
          log_type: string | null
          message: string
          metadata: Json | null
          run_id: string
          screenshot_url: string | null
          step_number: number
          timestamp: string
        }
        Insert: {
          id?: string
          log_type?: string | null
          message: string
          metadata?: Json | null
          run_id: string
          screenshot_url?: string | null
          step_number: number
          timestamp?: string
        }
        Update: {
          id?: string
          log_type?: string | null
          message?: string
          metadata?: Json | null
          run_id?: string
          screenshot_url?: string | null
          step_number?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_logs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "task_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sap_connections: {
        Row: {
          client: string
          connection_config: Json | null
          created_at: string
          host: string
          id: string
          is_active: boolean
          last_tested_at: string | null
          name: string
          system_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client: string
          connection_config?: Json | null
          created_at?: string
          host: string
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          name: string
          system_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client?: string
          connection_config?: Json | null
          created_at?: string
          host?: string
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          name?: string
          system_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_runs: {
        Row: {
          created_at: string
          current_step: string
          custom_task: string | null
          end_time: string | null
          error_message: string | null
          execution_metadata: Json | null
          id: string
          progress: number
          sap_system: string | null
          screenshots: Json | null
          start_time: string
          status: string
          template_id: string | null
          template_inputs: Json | null
          template_name: string | null
          updated_at: string
          user_id: string
          validation_results: Json | null
        }
        Insert: {
          created_at?: string
          current_step: string
          custom_task?: string | null
          end_time?: string | null
          error_message?: string | null
          execution_metadata?: Json | null
          id: string
          progress?: number
          sap_system?: string | null
          screenshots?: Json | null
          start_time?: string
          status: string
          template_id?: string | null
          template_inputs?: Json | null
          template_name?: string | null
          updated_at?: string
          user_id: string
          validation_results?: Json | null
        }
        Update: {
          created_at?: string
          current_step?: string
          custom_task?: string | null
          end_time?: string | null
          error_message?: string | null
          execution_metadata?: Json | null
          id?: string
          progress?: number
          sap_system?: string | null
          screenshots?: Json | null
          start_time?: string
          status?: string
          template_id?: string | null
          template_inputs?: Json | null
          template_name?: string | null
          updated_at?: string
          user_id?: string
          validation_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "task_runs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          automation_type: string | null
          created_at: string
          description: string
          id: string
          inputs: Json
          name: string
          prompt: string
          sap_system: string | null
          screenshot_config: Json | null
          updated_at: string
          usage_count: number
          user_id: string
          validation_rules: Json | null
        }
        Insert: {
          automation_type?: string | null
          created_at?: string
          description: string
          id?: string
          inputs?: Json
          name: string
          prompt: string
          sap_system?: string | null
          screenshot_config?: Json | null
          updated_at?: string
          usage_count?: number
          user_id: string
          validation_rules?: Json | null
        }
        Update: {
          automation_type?: string | null
          created_at?: string
          description?: string
          id?: string
          inputs?: Json
          name?: string
          prompt?: string
          sap_system?: string | null
          screenshot_config?: Json | null
          updated_at?: string
          usage_count?: number
          user_id?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          created_at: string
          id: string
          step_config: Json
          step_order: number
          step_type: string
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          step_config?: Json
          step_order: number
          step_type: string
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          step_config?: Json
          step_order?: number
          step_type?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "viewer"],
    },
  },
} as const
