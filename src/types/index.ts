import { Database } from './database';

export * from './database';

export type Car = Database['public']['Tables']['cars']['Row'];
export type CarInsert = Database['public']['Tables']['cars']['Insert'];
export type CarUpdate = Database['public']['Tables']['cars']['Update'];

export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface CarFilters {
  make?: string;
  fuel_type?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  searchQuery?: string;
}

export interface ChatbotSuggestedAction {
  label: string;
  prompt: string;
}

export interface DashboardMetrics {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  totalLeads: number;
  newLeads: number;
  todayLeads: number;
}

export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Sales Manager' | 'Senior Sales Executive' | 'Service Advisor' | 'Master Technician' | 'Showroom Host';
  avatar?: string;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  role: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  notes?: string;
}
