export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          preferred_currency: string | null
          preferred_distance_unit: string | null
          preferred_fuel_unit: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferred_currency?: string | null
          preferred_distance_unit?: string | null
          preferred_fuel_unit?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferred_currency?: string | null
          preferred_distance_unit?: string | null
          preferred_fuel_unit?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          type: string
          image: string | null
          distance_unit: string
          fuel_unit: string
          fuel_capacity: number | null
          fuel_type: string | null
          has_two_tanks: boolean | null
          is_hybrid: boolean | null
          make: string | null
          model: string | null
          year: number | null
          license_plate: string | null
          vin: string | null
          insurance_policy: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          type: string
          image?: string | null
          distance_unit: string
          fuel_unit: string
          fuel_capacity?: number | null
          fuel_type?: string | null
          has_two_tanks?: boolean | null
          is_hybrid?: boolean | null
          make?: string | null
          model?: string | null
          year?: number | null
          license_plate?: string | null
          vin?: string | null
          insurance_policy?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          type?: string
          image?: string | null
          distance_unit?: string
          fuel_unit?: string
          fuel_capacity?: number | null
          fuel_type?: string | null
          has_two_tanks?: boolean | null
          is_hybrid?: boolean | null
          make?: string | null
          model?: string | null
          year?: number | null
          license_plate?: string | null
          vin?: string | null
          insurance_policy?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      fuel_logs: {
        Row: {
          id: string
          vehicle_id: string
          user_id: string
          date: string
          odometer: number | null
          is_trip: boolean
          trip_distance: number | null
          fuel_amount: number
          fuel_type: string
          price_per_unit: number
          total_cost: number
          currency: string
          gas_station: string | null
          notes: string | null
          images: string[] | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          vehicle_id: string
          user_id: string
          date: string
          odometer?: number | null
          is_trip: boolean
          trip_distance?: number | null
          fuel_amount: number
          fuel_type: string
          price_per_unit: number
          total_cost: number
          currency: string
          gas_station?: string | null
          notes?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          vehicle_id?: string
          user_id?: string
          date?: string
          odometer?: number | null
          is_trip?: boolean
          trip_distance?: number | null
          fuel_amount?: number
          fuel_type?: string
          price_per_unit?: number
          total_cost?: number
          currency?: string
          gas_station?: string | null
          notes?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
      }
      maintenance_logs: {
        Row: {
          id: string
          vehicle_id: string
          user_id: string
          date: string
          odometer: number | null
          service_type: string
          description: string
          cost: number | null
          currency: string | null
          service_provider: string | null
          notes: string | null
          images: string[] | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          vehicle_id: string
          user_id: string
          date: string
          odometer?: number | null
          service_type: string
          description: string
          cost?: number | null
          currency?: string | null
          service_provider?: string | null
          notes?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          vehicle_id?: string
          user_id?: string
          date?: string
          odometer?: number | null
          service_type?: string
          description?: string
          cost?: number | null
          currency?: string | null
          service_provider?: string | null
          notes?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string | null
          title: string
          description: string | null
          due_date: string
          odometer_threshold: number | null
          is_recurring: boolean | null
          recurrence_pattern: string | null
          is_completed: boolean | null
          completed_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id?: string | null
          title: string
          description?: string | null
          due_date: string
          odometer_threshold?: number | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          is_completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string | null
          title?: string
          description?: string | null
          due_date?: string
          odometer_threshold?: number | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          is_completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      user_settings: {
        Row: {
          user_id: string
          theme: string | null
          notification_preferences: Json | null
          dashboard_layout: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          user_id: string
          theme?: string | null
          notification_preferences?: Json | null
          dashboard_layout?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          theme?: string | null
          notification_preferences?: Json | null
          dashboard_layout?: Json | null
          created_at?: string
          updated_at?: string | null
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
      [_ in never]: never
    }
  }
}
