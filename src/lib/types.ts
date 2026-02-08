export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type PriceType = 'base' | 'weekend' | 'holiday' | 'high_season' | 'package';
export type AppRole = 'admin' | 'user';

export interface Guest {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  document: string | null;
  notes: string | null;
  reservation_count: number;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  guest_id: string | null;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_amount: number;
  discount_amount: number;
  deposit_amount: number;
  status: ReservationStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  contract_url?: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  tracking_code: string | null;
  contract_accepted: boolean | null;
  contract_accepted_at: string | null;
  contract_ip: string | null;
  guest?: Guest;
}

export interface Payment {
  id: string;
  reservation_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  notes: string | null;
  contract_url?: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingRule {
  id: string;
  name: string;
  price_type: PriceType;
  daily_rate: number;
  min_nights: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockedDate {
  id: string;
  reservation_id?: string | null;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export interface PropertySettings {
  id: string;
  name: string;
  description: string | null;
  max_guests: number | null;
  amenities: string[] | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}
