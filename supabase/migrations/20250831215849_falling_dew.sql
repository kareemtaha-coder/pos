/*
  # إضافة جداول إضافية لنظام نقطة البيع المتقدم

  1. الجداول الجديدة
    - `quotations` - عروض الأسعار
    - `quotation_items` - أصناف عروض الأسعار
    - `stock_adjustments` - تسويات المخزون
    - `cash_register_transactions` - معاملات الصندوق
    - `customer_payments` - مدفوعات العملاء
    - `returns` - المرتجعات

  2. الأمان
    - تفعيل RLS على جميع الجداول الجديدة
    - إضافة سياسات مناسبة

  3. الفهارس
    - فهارس على الأعمدة المهمة للأداء
*/

-- Quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  valid_until date NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quotation items table
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Stock adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('add', 'subtract')),
  quantity integer NOT NULL,
  reason text NOT NULL,
  old_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

-- Cash register transactions table
CREATE TABLE IF NOT EXISTS cash_register_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('opening', 'closing', 'deposit', 'withdrawal')),
  amount decimal(10,2) NOT NULL DEFAULT 0,
  description text NOT NULL,
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

-- Customer payments table
CREATE TABLE IF NOT EXISTS customer_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer')),
  description text,
  reference_number text,
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

-- Returns table
CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_sale_id uuid REFERENCES sales(id),
  return_amount decimal(10,2) NOT NULL DEFAULT 0,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_register_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotations
CREATE POLICY "Users can read quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage quotations"
  ON quotations
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for quotation_items
CREATE POLICY "Users can read quotation_items"
  ON quotation_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage quotation_items"
  ON quotation_items
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for stock_adjustments
CREATE POLICY "Users can read stock_adjustments"
  ON stock_adjustments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create stock_adjustments"
  ON stock_adjustments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for cash_register_transactions
CREATE POLICY "Users can read cash_register_transactions"
  ON cash_register_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage cash_register_transactions"
  ON cash_register_transactions
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for customer_payments
CREATE POLICY "Users can read customer_payments"
  ON customer_payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage customer_payments"
  ON customer_payments
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for returns
CREATE POLICY "Users can read returns"
  ON returns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage returns"
  ON returns
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product_id ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created_at ON stock_adjustments(created_at);
CREATE INDEX IF NOT EXISTS idx_cash_register_created_at ON cash_register_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_payments_customer_id ON customer_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_sale_id ON returns(original_sale_id);

-- Create triggers for updated_at
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment stock (for returns)
CREATE OR REPLACE FUNCTION increment_stock(product_id uuid, quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET stock_quantity = stock_quantity + quantity,
      updated_at = now()
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;