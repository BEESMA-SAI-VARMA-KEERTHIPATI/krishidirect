export type UserRole = 'farmer' | 'buyer' | 'agent' | 'transporter' | 'admin';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  preferred_lang?: string;
  speech_lang?: string;
  voice_lang?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProduceListing {
  id: number;
  farmer_id: number;
  produce_name: string;
  category: string;
  variety?: string;
  description?: string;
  image_url?: string;
  available_quantity: number;
  initial_quantity: number;
  unit: string;
  asking_price: number;
  quality_grade: string;
  harvest_date?: string;
  farm_location: string;
  district?: string;
  state?: string;
  pickup_method: string;
  status: 'active' | 'paused' | 'sold_out' | 'cancelled';
  created_at: string;
  updated_at: string;
  farmer?: {
    id: number;
    full_name: string;
    village?: string;
    phone?: string;
  };
}

export interface DeliveryEvent {
  id: number;
  event_type: string;
  actor_id?: number;
  actor_name?: string;
  actor_role?: string;
  title: string;
  description?: string;
  location?: string;
  badge_color: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  buyer_id: number;
  seller_id: number;
  listing_id: number;
  produce_name: string;
  variety?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  produce_total: number;
  delivery_fee: number;
  service_fee: number;
  total_amount: number;
  delivery_address: string;
  delivery_method: string;
  status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'held_in_escrow' | 'released_to_farmer' | 'refunded';
  payment_method: string;
  payment_transaction_id?: string;
  transporter_id?: number;
  created_at: string;
  updated_at: string;
  buyer?: { id: number; full_name: string; phone?: string; village?: string };
  seller?: { id: number; full_name: string; phone?: string; village?: string };
  transporter?: { id: number; full_name: string; phone?: string; village?: string };
  timeline_events: DeliveryEvent[];
  demo_otp_preview?: string;
}

export interface PoolParticipant {
  id: number;
  pool_id: number;
  farmer_id: number;
  farmer_name: string;
  farmer_phone?: string;
  village: string;
  produce_name: string;
  quantity_kg: number;
  crate_count: number;
  pickup_address?: string;
  status: string;
  estimated_savings_inr: number;
  created_at?: string;
}

export interface HarvestPool {
  id: number;
  pool_code: string;
  title: string;
  produce_type: string;
  village_cluster: string;
  destination_market: string;
  collection_point: string;
  target_capacity_kg: number;
  current_pooled_kg: number;
  pickup_date: string;
  time_window: string;
  individual_freight_est: number;
  pooled_freight_est: number;
  savings_percentage: number;
  carbon_reduction_kg: number;
  status: 'forming' | 'matched' | 'scheduled' | 'in_transit' | 'completed' | 'cancelled';
  village_agent_id?: number;
  transporter_id?: number;
  vehicle_type: string;
  notes?: string;
  created_at: string;
  participants: PoolParticipant[];
}

export interface PriceFactorBreakdown {
  factor_name: string;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
  adjustment_inr: number;
}

export interface PriceEstimate {
  produce_name: string;
  quality_grade: string;
  market_region: string;
  estimated_min_price: number;
  estimated_modal_price: number;
  estimated_max_price: number;
  suggested_asking_price: number;
  unit: string;
  price_difference?: number;
  difference_percentage?: number;
  status_assessment: string;
  confidence_score: number;
  data_freshness: string;
  factors: PriceFactorBreakdown[];
  is_demonstration_data: boolean;
  disclaimer: string;
}

export interface ProfitCalcResult {
  quantity: number;
  unit_selling_price: number;
  gross_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_per_unit: number;
  profit_margin_pct: number;
  break_even_price_per_unit: number;
  expense_breakdown: Record<string, number>;
  alternative_comparison?: {
    scenario_name: string;
    intermediary_selling_price: number;
    intermediary_revenue: number;
    intermediary_commissions_loss: number;
    intermediary_net_profit: number;
    extra_profit_with_krishidirect: number;
    extra_profit_percentage: number;
  };
  notes: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  action_link?: string;
  created_at: string;
}

export interface CartItem {
  listing: ProduceListing;
  quantity: number;
}
