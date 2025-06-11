export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
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
