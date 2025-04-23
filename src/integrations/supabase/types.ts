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
      activity_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          action_type: string
          description: string
          entity_type: string
          entity_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          action_type: string
          description: string
          entity_type: string
          entity_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          action_type?: string
          description?: string
          entity_type?: string
          entity_id?: string | null
        }
      }
      classes: {
        Row: {
          id: string
          created_at: string
          name: string
          grade_level: number
          teacher_id: string | null
          subject: string | null
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          grade_level: number
          teacher_id?: string | null
          subject?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          grade_level?: number
          teacher_id?: string | null
          subject?: string | null
          description?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string
          role: 'admin' | 'teacher' | 'parent'
          email: string
          phone: string | null
          address: string | null
        }
        Insert: {
          id: string
          created_at?: string
          full_name: string
          role: 'admin' | 'teacher' | 'parent'
          email: string
          phone?: string | null
          address?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string
          role?: 'admin' | 'teacher' | 'parent'
          email?: string
          phone?: string | null
          address?: string | null
        }
      }
      students: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          admission_number: string
          class_id: string | null
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          admission_number: string
          class_id?: string | null
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: string
          admission_number?: string
          class_id?: string | null
          parent_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'teacher' | 'parent'
    }
  }
}
