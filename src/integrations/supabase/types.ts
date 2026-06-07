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
      achievements: {
        Row: {
          badge_key: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          badge_key: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          badge_key?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      aptitude_attempts: {
        Row: {
          accuracy: number
          ai_feedback: Json | null
          correct_count: number
          created_at: string
          difficulty: string
          id: string
          ideal_time_sec: number
          mode: string
          subtopic: string | null
          topic: string
          total_questions: number
          total_time_sec: number
          user_id: string
        }
        Insert: {
          accuracy?: number
          ai_feedback?: Json | null
          correct_count?: number
          created_at?: string
          difficulty: string
          id?: string
          ideal_time_sec?: number
          mode: string
          subtopic?: string | null
          topic: string
          total_questions: number
          total_time_sec?: number
          user_id: string
        }
        Update: {
          accuracy?: number
          ai_feedback?: Json | null
          correct_count?: number
          created_at?: string
          difficulty?: string
          id?: string
          ideal_time_sec?: number
          mode?: string
          subtopic?: string | null
          topic?: string
          total_questions?: number
          total_time_sec?: number
          user_id?: string
        }
        Relationships: []
      }
      aptitude_question_logs: {
        Row: {
          attempt_id: string
          bookmarked: boolean
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          ideal_time_sec: number
          is_correct: boolean
          mistake_type: string | null
          options: Json
          question_text: string
          selected_answer: string | null
          shortcut: string | null
          time_taken_sec: number
          user_id: string
        }
        Insert: {
          attempt_id: string
          bookmarked?: boolean
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          ideal_time_sec?: number
          is_correct?: boolean
          mistake_type?: string | null
          options: Json
          question_text: string
          selected_answer?: string | null
          shortcut?: string | null
          time_taken_sec?: number
          user_id: string
        }
        Update: {
          attempt_id?: string
          bookmarked?: boolean
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          ideal_time_sec?: number
          is_correct?: boolean
          mistake_type?: string | null
          options?: Json
          question_text?: string
          selected_answer?: string | null
          shortcut?: string | null
          time_taken_sec?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_question_logs_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "aptitude_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_attempts: {
        Row: {
          ai_feedback: Json | null
          code: string
          complexity: string | null
          correctness_score: number
          created_at: string
          difficulty: string
          efficiency_score: number
          id: string
          language: string
          problem_statement: string
          problem_title: string
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          code: string
          complexity?: string | null
          correctness_score?: number
          created_at?: string
          difficulty: string
          efficiency_score?: number
          id?: string
          language?: string
          problem_statement: string
          problem_title: string
          status?: string
          topic: string
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          code?: string
          complexity?: string | null
          correctness_score?: number
          created_at?: string
          difficulty?: string
          efficiency_score?: number
          id?: string
          language?: string
          problem_statement?: string
          problem_title?: string
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      company_interviews: {
        Row: {
          ai_report: Json | null
          aptitude_score: number | null
          coding_score: number | null
          communication_score: number | null
          company_name: string
          company_type: string
          confidence_score: number | null
          created_at: string
          current_round: number
          final_score: number | null
          hr_content_score: number | null
          id: string
          rounds: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_report?: Json | null
          aptitude_score?: number | null
          coding_score?: number | null
          communication_score?: number | null
          company_name: string
          company_type: string
          confidence_score?: number | null
          created_at?: string
          current_round?: number
          final_score?: number | null
          hr_content_score?: number | null
          id?: string
          rounds?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_report?: Json | null
          aptitude_score?: number | null
          coding_score?: number | null
          communication_score?: number | null
          company_name?: string
          company_type?: string
          confidence_score?: number | null
          created_at?: string
          current_round?: number
          final_score?: number | null
          hr_content_score?: number | null
          id?: string
          rounds?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_activity: {
        Row: {
          activity_date: string
          avg_score: number
          id: string
          questions_attempted: number
          tests_taken: number
          time_spent_min: number
          user_id: string
        }
        Insert: {
          activity_date: string
          avg_score?: number
          id?: string
          questions_attempted?: number
          tests_taken?: number
          time_spent_min?: number
          user_id: string
        }
        Update: {
          activity_date?: string
          avg_score?: number
          id?: string
          questions_attempted?: number
          tests_taken?: number
          time_spent_min?: number
          user_id?: string
        }
        Relationships: []
      }
      hr_sessions: {
        Row: {
          ai_feedback: Json | null
          confidence_score: number | null
          content_score: number | null
          created_at: string
          fluency_score: number | null
          id: string
          mode: string
          overall_score: number | null
          target_role: string | null
          transcript: Json
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          confidence_score?: number | null
          content_score?: number | null
          created_at?: string
          fluency_score?: number | null
          id?: string
          mode?: string
          overall_score?: number | null
          target_role?: string | null
          transcript?: Json
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          confidence_score?: number | null
          content_score?: number | null
          created_at?: string
          fluency_score?: number | null
          id?: string
          mode?: string
          overall_score?: number | null
          target_role?: string | null
          transcript?: Json
          user_id?: string
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
          last_active_date: string | null
          streak_days: number
          target_role: string | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_active_date?: string | null
          streak_days?: number
          target_role?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_active_date?: string | null
          streak_days?: number
          target_role?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_analyses: {
        Row: {
          ats_score: number
          created_at: string
          experience_score: number | null
          file_name: string | null
          file_path: string | null
          generated_questions: Json | null
          id: string
          missing_keywords: Json | null
          projects_score: number | null
          raw_text: string | null
          skills_score: number | null
          suggestions: Json | null
          target_role: string | null
          user_id: string
        }
        Insert: {
          ats_score?: number
          created_at?: string
          experience_score?: number | null
          file_name?: string | null
          file_path?: string | null
          generated_questions?: Json | null
          id?: string
          missing_keywords?: Json | null
          projects_score?: number | null
          raw_text?: string | null
          skills_score?: number | null
          suggestions?: Json | null
          target_role?: string | null
          user_id: string
        }
        Update: {
          ats_score?: number
          created_at?: string
          experience_score?: number | null
          file_name?: string | null
          file_path?: string | null
          generated_questions?: Json | null
          id?: string
          missing_keywords?: Json | null
          projects_score?: number | null
          raw_text?: string | null
          skills_score?: number | null
          suggestions?: Json | null
          target_role?: string | null
          user_id?: string
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
