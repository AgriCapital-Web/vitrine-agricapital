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
    PostgrestVersion: "14.1"
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
          id: string
          language: string | null
          session_id: string
          user_message: string
        }
        Insert: {
          assistant_response: string
          created_at?: string
          id?: string
          language?: string | null
          session_id: string
          user_message: string
        }
        Update: {
          assistant_response?: string
          created_at?: string
          id?: string
          language?: string | null
          session_id?: string
          user_message?: string
        }
        Relationships: []
      }
      auto_responses: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          priority: number
          response_ar: string | null
          response_de: string | null
          response_en: string | null
          response_es: string | null
          response_fr: string
          response_zh: string | null
          trigger_keyword: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number
          response_ar?: string | null
          response_de?: string | null
          response_en?: string | null
          response_es?: string | null
          response_fr: string
          response_zh?: string | null
          trigger_keyword: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number
          response_ar?: string | null
          response_de?: string | null
          response_en?: string | null
          response_es?: string | null
          response_fr?: string
          response_zh?: string | null
          trigger_keyword?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          body: string
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
        }
        Relationships: []
      }
      email_recipients: {
        Row: {
          created_at: string
          email: string
          group_name: string | null
          id: string
          is_active: boolean
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          group_name?: string | null
          id?: string
          is_active?: boolean
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          group_name?: string | null
          id?: string
          is_active?: boolean
          name?: string | null
        }
        Relationships: []
      }
      email_signatures: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          data: Json
          form_id: string | null
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          data?: Json
          form_id?: string | null
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          data?: Json
          form_id?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "site_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          domain?: string | null
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
      site_forms: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          id: string
          is_active: boolean
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json | null
          slug?: string
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
          name: string
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
          name: string
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
          name?: string
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
      site_pages: {
        Row: {
          created_at: string
          description_ar: string | null
          description_de: string | null
          description_en: string | null
          description_es: string | null
          description_fr: string | null
          description_zh: string | null
          id: string
          is_active: boolean
          is_home: boolean
          meta_description_ar: string | null
          meta_description_de: string | null
          meta_description_en: string | null
          meta_description_es: string | null
          meta_description_fr: string | null
          meta_description_zh: string | null
          meta_title_ar: string | null
          meta_title_de: string | null
          meta_title_en: string | null
          meta_title_es: string | null
          meta_title_fr: string | null
          meta_title_zh: string | null
          order_index: number
          slug: string
          title_ar: string | null
          title_de: string | null
          title_en: string | null
          title_es: string | null
          title_fr: string
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_de?: string | null
          description_en?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_zh?: string | null
          id?: string
          is_active?: boolean
          is_home?: boolean
          meta_description_ar?: string | null
          meta_description_de?: string | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_fr?: string | null
          meta_description_zh?: string | null
          meta_title_ar?: string | null
          meta_title_de?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          meta_title_fr?: string | null
          meta_title_zh?: string | null
          order_index?: number
          slug: string
          title_ar?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr: string
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_de?: string | null
          description_en?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_zh?: string | null
          id?: string
          is_active?: boolean
          is_home?: boolean
          meta_description_ar?: string | null
          meta_description_de?: string | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_fr?: string | null
          meta_description_zh?: string | null
          meta_title_ar?: string | null
          meta_title_de?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          meta_title_fr?: string | null
          meta_title_zh?: string | null
          order_index?: number
          slug?: string
          title_ar?: string | null
          title_de?: string | null
          title_en?: string | null
          title_es?: string | null
          title_fr?: string
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_sections: {
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
          name: string
          order_index: number
          page_id: string | null
          settings: Json | null
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
          name: string
          order_index?: number
          page_id?: string | null
          settings?: Json | null
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
          name?: string
          order_index?: number
          page_id?: string | null
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          type: string
          updated_at: string
          value: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          type?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          type?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      visitor_contacts: {
        Row: {
          collected_via: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          phone: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          collected_via?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          phone?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          collected_via?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          phone?: string | null
          session_id?: string
          updated_at?: string
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
