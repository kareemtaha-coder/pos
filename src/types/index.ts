export interface Product {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  barcode?: string;
  sku: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
  category_id?: string;
  supplier_id?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_number?: string;
  customer_type: 'regular' | 'wholesale' | 'vip';
  credit_limit: number;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_number?: string;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  invoice_number: string;
  customer_id?: string;
  user_id: string;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_method: 'cash' | 'credit' | 'card' | 'partial';
  payment_status: 'paid' | 'pending' | 'partial';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'cashier' | 'manager' | 'inventory';
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
}

export interface PaymentMethod {
  type: 'cash' | 'credit' | 'card' | 'partial';
  amount: number;
  reference?: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id?: string;
  user_id: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface StockAdjustment {
  id: string;
  product_id: string;
  adjustment_type: 'add' | 'subtract';
  quantity: number;
  reason: string;
  old_quantity: number;
  new_quantity: number;
  user_id: string;
  created_at: string;
}

export interface CashRegisterTransaction {
  id: string;
  type: 'opening' | 'closing' | 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  user_id: string;
  created_at: string;
}

export interface CustomerPayment {
  id: string;
  customer_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer';
  description?: string;
  reference_number?: string;
  user_id: string;
  created_at: string;
}

export interface Return {
  id: string;
  original_sale_id: string;
  return_amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
  user_id: string;
  created_at: string;
}