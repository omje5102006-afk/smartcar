export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'dealer' | 'sales' | 'customer';
export type CarStatus = 'available' | 'reserved' | 'sold';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng';
export type TransmissionType = 'automatic' | 'manual';
export type LeadSource = 'chatbot' | 'web_form' | 'walk_in' | 'phone';
export type LeadStatus = 'new' | 'contacted' | 'test_drive_booked' | 'closed' | 'lost';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cars: {
        Row: {
          id: string;
          make: string;
          model: string;
          year: number;
          price: number;
          mileage: number;
          fuel_type: FuelType;
          transmission: TransmissionType;
          condition: string;
          color: string | null;
          owners: number | null;
          description: string | null;
          features: string[];
          images: string[];
          status: CarStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          make: string;
          model: string;
          year: number;
          price: number;
          mileage: number;
          fuel_type: FuelType;
          transmission: TransmissionType;
          condition?: string;
          color?: string | null;
          owners?: number | null;
          description?: string | null;
          features?: string[];
          images?: string[];
          status?: CarStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          make?: string;
          model?: string;
          year?: number;
          price?: number;
          mileage?: number;
          fuel_type?: FuelType;
          transmission?: TransmissionType;
          condition?: string;
          color?: string | null;
          owners?: number | null;
          description?: string | null;
          features?: string[];
          images?: string[];
          status?: CarStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          car_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          message: string | null;
          preferred_date: string | null;
          source: LeadSource;
          status: LeadStatus;
          assigned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          car_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          message?: string | null;
          preferred_date?: string | null;
          source?: LeadSource;
          status?: LeadStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          message?: string | null;
          preferred_date?: string | null;
          source?: LeadSource;
          status?: LeadStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      car_status: CarStatus;
      fuel_type: FuelType;
      transmission_type: TransmissionType;
      lead_source: LeadSource;
      lead_status: LeadStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
