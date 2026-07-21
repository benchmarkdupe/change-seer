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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          max_supply: number | null
          name: string
          rarity: string
          retired_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          description: string
          icon?: string
          id: string
          max_supply?: number | null
          name: string
          rarity?: string
          retired_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          max_supply?: number | null
          name?: string
          rarity?: string
          retired_at?: string | null
        }
        Relationships: []
      }
      opportunity_signals: {
        Row: {
          detected_at: string
          evidence: string
          id: string
          ingested_at: string
          opportunity_key: string
          raw_payload: Json | null
          scout_id: string
          signal_type: string
          source_confidence: number
          source_url: string | null
          value: number
        }
        Insert: {
          detected_at?: string
          evidence: string
          id?: string
          ingested_at?: string
          opportunity_key: string
          raw_payload?: Json | null
          scout_id: string
          signal_type: string
          source_confidence?: number
          source_url?: string | null
          value: number
        }
        Update: {
          detected_at?: string
          evidence?: string
          id?: string
          ingested_at?: string
          opportunity_key?: string
          raw_payload?: Json | null
          scout_id?: string
          signal_type?: string
          source_confidence?: number
          source_url?: string | null
          value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          interests: string[] | null
          region: string | null
          updated_at: string
          username: string | null
          visibility: Database["public"]["Enums"]["profile_visibility"]
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          interests?: string[] | null
          region?: string | null
          updated_at?: string
          username?: string | null
          visibility?: Database["public"]["Enums"]["profile_visibility"]
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          region?: string | null
          updated_at?: string
          username?: string | null
          visibility?: Database["public"]["Enums"]["profile_visibility"]
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          opportunity_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["profile_visibility"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          opportunity_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["profile_visibility"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          opportunity_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["profile_visibility"]
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          id: string
          note: string | null
          opportunity_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          note?: string | null
          opportunity_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          note?: string | null
          opportunity_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      source_health: {
        Row: {
          last_error: string | null
          last_failure_at: string | null
          last_success_at: string | null
          records_last_run: number
          refresh_interval_minutes: number
          scout_id: string
          scout_name: string
          status: Database["public"]["Enums"]["source_status"]
          total_runs: number
          updated_at: string
        }
        Insert: {
          last_error?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          records_last_run?: number
          refresh_interval_minutes?: number
          scout_id: string
          scout_name: string
          status?: Database["public"]["Enums"]["source_status"]
          total_runs?: number
          updated_at?: string
        }
        Update: {
          last_error?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          records_last_run?: number
          refresh_interval_minutes?: number
          scout_id?: string
          scout_name?: string
          status?: Database["public"]["Enums"]["source_status"]
          total_runs?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_cents: number
          category: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          occurred_at: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["transaction_kind"]
          occurred_at?: string
          project_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["transaction_kind"]
          occurred_at?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          displayed: boolean
          earned_at: string
          id: string
          issue_number: number | null
          user_id: string
        }
        Insert: {
          badge_id: string
          displayed?: boolean
          earned_at?: string
          id?: string
          issue_number?: number | null
          user_id: string
        }
        Update: {
          badge_id?: string
          displayed?: boolean
          earned_at?: string
          id?: string
          issue_number?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
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
      app_role:
        | "user"
        | "early_access"
        | "builder"
        | "moderator"
        | "admin"
        | "developer"
      profile_visibility: "public" | "private"
      project_status:
        | "exploring"
        | "building"
        | "launched"
        | "paused"
        | "shelved"
      source_status: "healthy" | "degraded" | "down" | "never_run"
      transaction_kind: "income" | "expense"
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
      app_role: [
        "user",
        "early_access",
        "builder",
        "moderator",
        "admin",
        "developer",
      ],
      profile_visibility: ["public", "private"],
      project_status: [
        "exploring",
        "building",
        "launched",
        "paused",
        "shelved",
      ],
      source_status: ["healthy", "degraded", "down", "never_run"],
      transaction_kind: ["income", "expense"],
    },
  },
} as const
