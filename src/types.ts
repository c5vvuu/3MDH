export type ProductType = 'digital' | 'service' | 'subscription' | 'variable' | 'custom';

export type DeliveryType = 'instant' | 'manual' | 'code' | 'file' | 'account';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'pending_processing'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod =
  | 'paypal'
  | 'wallet'
  | 'manual'; // Specific manual method identified by manual_method_id

export interface ManualPaymentMethod {
  id: string;
  name: string; // e.g., Zain Cash, CliQ, RedotPay, Binance Pay, STC Pay, Bank Transfer
  name_en: string;
  category: 'jordan_wallet' | 'crypto' | 'global_wallet' | 'local_wallet' | 'bank';
  currency: string; // The designated currency for this payment method (e.g., JOD, USD, SAR)
  recipient_account: string; // Phone number, Binance Pay ID, RedotPay ID, IBAN, Wallet ID
  account_name?: string; // Account holder name
  instructions: string; // Step by step instruction for customer
  instructions_en?: string;
  icon_type: string; // e.g. 'zain', 'cliq', 'binance', 'redotpay', 'stc', 'bank'
  is_active: boolean;
  min_amount?: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  title: string;
  title_en: string;
  sku: string;
  price: number;
  discount_price?: number;
  stock: number;
  delivery_time: string;
  duration_days?: number;
  is_active: number;
  sort_order: number;
}

export interface ProductRequirement {
  id: number;
  product_id: number;
  field_label: string;
  field_label_en: string;
  field_type: 'text' | 'url' | 'textarea' | 'number' | 'email' | 'select';
  placeholder?: string;
  options?: string[];
  is_required: number;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  description_en?: string;
  type: ProductType;
  base_price: number;
  discount_price?: number;
  stock: number;
  sku: string;
  delivery_type: DeliveryType;
  delivery_time_text: string;
  duration_days?: number;
  is_featured: number;
  is_active: number;
  image: string;
  rating: number;
  total_reviews: number;
  variants: ProductVariant[];
  requirements: ProductRequirement[];
}

export interface Category {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: number;
}

export interface CartItem {
  cart_item_id: string;
  product_id: number;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  requirements: Record<string, string>;
  unit_price: number;
  total_price: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  product_name: string;
  variant_title?: string;
  price: number;
  quantity: number;
  subtotal: number;
  requirements?: { field_label: string; field_value: string }[];
  delivered_item?: { item_type: string; content: string };
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  manual_method_id?: string;
  manual_method_name?: string;
  payment_receipt_url?: string;
  payment_sender_info?: string;
  payment_transaction_ref?: string;
  order_status: OrderStatus;
  customer_notes?: string;
  admin_notes?: string;
  delivery_notes?: string;
  created_at: string;
  items: OrderItem[];
}

export interface Subscription {
  id: number;
  user_id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  product_name: string;
  image: string;
  start_date: string;
  expires_at: string;
  duration_days: number;
  days_left: number;
  status: 'active' | 'expiring' | 'expired' | 'cancelled';
  credentials?: string;
}

export interface DigitalInventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  order_number: string;
  item_type: 'license_key' | 'code' | 'account' | 'file_link' | 'text_instruction';
  content: string;
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit: number;
  usage_count: number;
  is_active: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: number;
  created_at: string;
}

export interface WalletTransaction {
  id: number;
  type: 'deposit' | 'deduction' | 'refund';
  amount: number;
  description: string;
  created_at: string;
}

export interface Wallet {
  user_id: number;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface StoreSettings {
  store_name: string;
  store_name_en: string;
  store_url?: string;
  store_tagline: string;
  store_logo: string;
  default_currency: string;
  allowed_currencies: string[];
  primary_color: string;
  secondary_color: string;
  support_whatsapp: string;
  support_email: string;
  support_telegram: string;
  // Automated Gateways: Only PayPal is kept as requested
  payment_paypal_enabled: string;
  payment_paypal_client_id: string;
  payment_paypal_mode: 'sandbox' | 'live';
  payment_wallet_enabled: string;
  // Manual Payment Methods (Jordan wallets, Binance Pay, RedotPay, STC, etc.)
  manual_payment_methods: ManualPaymentMethod[];
  smtp_host: string;
  smtp_port: string;
  smtp_secure: string;
  smtp_username: string;
  homepage_sections: string[];
}

export interface MobileAppConfig {
  app_name: string;
  app_name_en: string;
  package_id: string;
  app_version: string;
  build_number: number;
  min_supported_version: string;
  force_update: boolean;
  apk_download_url: string;
  update_title_ar: string;
  update_message_ar: string;
  announcement_enabled: boolean;
  announcement_text_ar: string;
  announcement_coupon: string;
  maintenance_mode: boolean;
  maintenance_message_ar: string;
  splash_bg_color: string;
  push_notifications_enabled: boolean;
  direct_apk_ready: boolean;
}

