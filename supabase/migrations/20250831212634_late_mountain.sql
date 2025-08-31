/*
  # إنشاء قاعدة بيانات نظام نقطة البيع

  1. الجداول الجديدة
    - `products` - إدارة المنتجات والمخزون
      - `id` (uuid, مفتاح أساسي)
      - `name` (نص، اسم المنتج بالإنجليزية)
      - `name_ar` (نص، اسم المنتج بالعربية)
      - `description` (نص، وصف المنتج)
      - `sku` (نص، كود المنتج)
      - `barcode` (نص، رمز الباركود)
      - `cost_price` (رقم، سعر التكلفة)
      - `selling_price` (رقم، سعر البيع)
      - `stock_quantity` (رقم، الكمية المتوفرة)
      - `min_stock_level` (رقم، الحد الأدنى للتنبيه)
      - `unit` (نص، وحدة القياس)
      - `category_id` (uuid، معرف الفئة)
      - `supplier_id` (uuid، معرف المورد)
      - `image_url` (نص، رابط الصورة)
      - `is_active` (منطقي، حالة النشاط)
      - `created_at`, `updated_at` (تواريخ الإنشاء والتحديث)

    - `customers` - إدارة العملاء
      - `id` (uuid, مفتاح أساسي)
      - `name` (نص، اسم العميل)
      - `phone`, `email`, `address` (بيانات الاتصال)
      - `tax_number` (نص، الرقم الضريبي)
      - `customer_type` (نوع العميل: عادي، جملة، مميز)
      - `credit_limit` (رقم، حد الائتمان)
      - `current_balance` (رقم، الرصيد الحالي)
      - `created_at`, `updated_at`

    - `suppliers` - إدارة الموردين
      - `id` (uuid, مفتاح أساسي)
      - `name` (نص، اسم المورد)
      - `contact_person`, `phone`, `email`, `address` (بيانات الاتصال)
      - `tax_number` (نص، الرقم الضريبي)
      - `current_balance` (رقم، الرصيد الحالي)
      - `created_at`, `updated_at`

    - `sales` - فواتير البيع
      - `id` (uuid, مفتاح أساسي)
      - `invoice_number` (نص، رقم الفاتورة)
      - `customer_id` (uuid، معرف العميل)
      - `user_id` (uuid، معرف البائع)
      - `subtotal`, `discount_amount`, `discount_percentage`, `tax_amount`, `total_amount`
      - `paid_amount` (رقم، المبلغ المدفوع)
      - `payment_method` (طريقة الدفع)
      - `payment_status` (حالة الدفع)
      - `notes` (ملاحظات)
      - `created_at`, `updated_at`

    - `sale_items` - أصناف فواتير البيع
      - `id` (uuid, مفتاح أساسي)
      - `sale_id` (uuid، معرف الفاتورة)
      - `product_id` (uuid، معرف المنتج)
      - `quantity`, `unit_price`, `discount_amount`, `total_price`
      - `created_at`

    - `users` - إدارة المستخدمين
      - `id` (uuid, مفتاح أساسي)
      - `email` (نص، البريد الإلكتروني)
      - `full_name` (نص، الاسم الكامل)
      - `role` (دور المستخدم)
      - `is_active` (منطقي، حالة النشاط)
      - `created_at`

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات للمستخدمين المسجلين
    - حماية البيانات الحساسة

  3. الفهارس
    - فهارس على الأعمدة المستخدمة في البحث والفرز
    - فهارس على المفاتيح الخارجية
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL,
  description text DEFAULT '',
  sku text UNIQUE NOT NULL,
  barcode text,
  cost_price decimal(10,2) NOT NULL DEFAULT 0,
  selling_price decimal(10,2) NOT NULL DEFAULT 0,
  stock_quantity integer NOT NULL DEFAULT 0,
  min_stock_level integer NOT NULL DEFAULT 5,
  unit text NOT NULL DEFAULT 'قطعة',
  category_id uuid,
  supplier_id uuid,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  tax_number text,
  customer_type text NOT NULL DEFAULT 'regular' CHECK (customer_type IN ('regular', 'wholesale', 'vip')),
  credit_limit decimal(10,2) NOT NULL DEFAULT 0,
  current_balance decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  tax_number text,
  current_balance decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  discount_amount decimal(10,2) NOT NULL DEFAULT 0,
  discount_percentage decimal(5,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  paid_amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit', 'card', 'partial')),
  payment_status text NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  discount_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Users profile table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier', 'manager', 'inventory')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for customers
CREATE POLICY "Users can read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for suppliers
CREATE POLICY "Users can read suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for sales
CREATE POLICY "Users can read sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for sale_items
CREATE POLICY "Users can read sale_items"
  ON sale_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage sale_items"
  ON sale_items
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for users
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name_ar ON products(name_ar);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'cashier'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();