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
      admin_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      ai_chat_logs: {
        Row: {
          assistant_response: string
          created_at: string
          error_message: string | null
          id: string
          language: string | null
          provider: string | null
          session_id: string
          status: string
          user_message: string
        }
        Insert: {
          assistant_response: string
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string | null
          provider?: string | null
          session_id: string
          status?: string
          user_message: string
        }
        Update: {
          assistant_response?: string
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string | null
          provider?: string | null
          session_id?: string
          status?: string
          user_message?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_history: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string
          destination: string | null
          error_message: string | null
          file_size: string | null
          format: string
          google_drive_file_id: string | null
          id: string
          status: string | null
          tables_included: Json | null
        }
        Insert: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          destination?: string | null
          error_message?: string | null
          file_size?: string | null
          format: string
          google_drive_file_id?: string | null
          id?: string
          status?: string | null
          tables_included?: Json | null
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          destination?: string | null
          error_message?: string | null
          file_size?: string | null
          format?: string
          google_drive_file_id?: string | null
          id?: string
          status?: string | null
          tables_included?: Json | null
        }
        Relationships: []
      }
      backup_settings: {
        Row: {
          auto_backup_enabled: boolean | null
          backup_destination: string | null
          backup_interval: string | null
          created_at: string
          google_drive_folder_id: string | null
          id: string
          last_backup_at: string | null
          next_backup_at: string | null
          updated_at: string
        }
        Insert: {
          auto_backup_enabled?: boolean | null
          backup_destination?: string | null
          backup_interval?: string | null
          created_at?: string
          google_drive_folder_id?: string | null
          id?: string
          last_backup_at?: string | null
          next_backup_at?: string | null
          updated_at?: string
        }
        Update: {
          auto_backup_enabled?: boolean | null
          backup_destination?: string | null
          backup_interval?: string | null
          created_at?: string
          google_drive_folder_id?: string | null
          id?: string
          last_backup_at?: string | null
          next_backup_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      broken_image_logs: {
        Row: {
          first_seen_at: string
          hits: number
          id: string
          image_url: string
          last_seen_at: string
          page_url: string | null
          status: string
          user_agent: string | null
        }
        Insert: {
          first_seen_at?: string
          hits?: number
          id?: string
          image_url: string
          last_seen_at?: string
          page_url?: string | null
          status?: string
          user_agent?: string | null
        }
        Update: {
          first_seen_at?: string
          hits?: number
          id?: string
          image_url?: string
          last_seen_at?: string
          page_url?: string | null
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string
          category: string
          content_ar: string | null
          content_de: string | null
          content_en: string | null
          content_es: string | null
          content_fr: string
          content_zh: string | null
          created_at: string
          excerpt_ar: string | null
          excerpt_de: string | null
          excerpt_en: string | null
          excerpt_es: string | null
          excerpt_fr: string | null
          excerpt_zh: string | null
          featured_image: string | null
          id: string
          images: Json
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          shares_count: number
          slug: string
          title_ar: string | null
          title_de: string | null
          title_en: string | null
          title_es: string | null
          title_fr: string
          title_zh: string | null
          updated_at: string
          videos: Json
          views_count: number
        }
        Insert: {
          author?: string
          category?: string
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr: string
          content_zh?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_de?: string | null
          excerpt_en?: string | null
          excerpt_es?: string | null
          excerpt_fr?: string | null
          excerpt_zh?: string | null
          featured_image?: string | null
          id?: string
          images?: Json
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          shares_count?: number
          slug: string
          title_ar?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr: string
          title_zh?: string | null
          updated_at?: string
          videos?: Json
          views_count?: number
        }
        Update: {
          author?: string
          category?: string
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr?: string
          content_zh?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_de?: string | null
          excerpt_en?: string | null
          excerpt_es?: string | null
          excerpt_fr?: string | null
          excerpt_zh?: string | null
          featured_image?: string | null
          id?: string
          images?: Json
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          shares_count?: number
          slug?: string
          title_ar?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr?: string
          title_zh?: string | null
          updated_at?: string
          videos?: Json
          views_count?: number
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          benefits: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          partner_count: number | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          partner_count?: number | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          partner_count?: number | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_ar: string | null
          content_de: string | null
          content_en: string | null
          content_es: string | null
          content_fr: string | null
          content_zh: string | null
          created_at: string
          id: string
          is_active: boolean
          key: string
          type: string
          updated_at: string
        }
        Insert: {
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          type?: string
          updated_at?: string
        }
        Update: {
          content_ar?: string | null
          content_de?: string | null
          content_en?: string | null
          content_es?: string | null
          content_fr?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_media: {
        Row: {
          alt_text_en: string | null
          alt_text_fr: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          is_archived: boolean
          name: string
          storage_path: string | null
          type: string
          url: string
        }
        Insert: {
          alt_text_en?: string | null
          alt_text_fr?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name: string
          storage_path?: string | null
          type?: string
          url: string
        }
        Update: {
          alt_text_en?: string | null
          alt_text_fr?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name?: string
          storage_path?: string | null
          type?: string
          url?: string
        }
        Relationships: []
      }
      site_menu: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label_ar: string | null
          label_de: string | null
          label_en: string | null
          label_es: string | null
          label_fr: string
          label_zh: string | null
          order_index: number
          parent_id: string | null
          target: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label_ar?: string | null
          label_de?: string | null
          label_en?: string | null
          label_es?: string | null
          label_fr: string
          label_zh?: string | null
          order_index?: number
          parent_id?: string | null
          target?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label_ar?: string | null
          label_de?: string | null
          label_en?: string | null
          label_es?: string | null
          label_fr?: string
          label_zh?: string | null
          order_index?: number
          parent_id?: string | null
          target?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_menu_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_menu"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          approved: boolean
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_agricapital_subscriber: boolean | null
          last_name: string
          photo_url: string | null
          status: string | null
          testimonial: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_agricapital_subscriber?: boolean | null
          last_name: string
          photo_url?: string | null
          status?: string | null
          testimonial: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_agricapital_subscriber?: boolean | null
          last_name?: string
          photo_url?: string | null
          status?: string | null
          testimonial?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_counters: {
        Row: {
          id: string
          total_visitors: number
          updated_at: string
          week_started_at: string
          weekly_visitors: number
        }
        Insert: {
          id: string
          total_visitors?: number
          updated_at?: string
          week_started_at?: string
          weekly_visitors?: number
        }
        Update: {
          id?: string
          total_visitors?: number
          updated_at?: string
          week_started_at?: string
          weekly_visitors?: number
        }
        Relationships: []
      }
    }
    Views: {
      testimonials_public: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string | null
          is_agricapital_subscriber: boolean | null
          last_name: string | null
          photo_url: string | null
          status: string | null
          testimonial: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_agricapital_subscriber?: boolean | null
          last_name?: string | null
          photo_url?: string | null
          status?: string | null
          testimonial?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          is_agricapital_subscriber?: boolean | null
          last_name?: string | null
          photo_url?: string | null
          status?: string | null
          testimonial?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_news_share: { Args: { p_news_id: string }; Returns: number }
      increment_news_view: { Args: { p_news_id: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      report_broken_image: {
        Args: { _image_url: string; _page_url: string; _user_agent: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
