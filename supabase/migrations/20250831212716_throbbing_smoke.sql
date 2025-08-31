/*
  # إدخال بيانات تجريبية لنظام نقطة البيع

  1. المنتجات التجريبية
    - منتجات متنوعة بأسعار وكميات مختلفة
    - أكواد SKU وباركود
    - مستويات مخزون متنوعة

  2. العملاء التجريبيون
    - أنواع عملاء مختلفة
    - أرصدة وحدود ائتمان متنوعة

  3. الموردين التجريبيون
    - موردين ببيانات كاملة
*/

-- Sample Products
INSERT INTO products (name, name_ar, sku, barcode, cost_price, selling_price, stock_quantity, min_stock_level, unit, is_active) VALUES
('Coca Cola 330ml', 'كوكا كولا 330مل', 'COLA-330', '1234567890123', 1.50, 3.00, 100, 20, 'علبة', true),
('Samsung Galaxy Earbuds', 'سماعات سامسونج جالاكسي', 'SAM-EARBUDS', '2345678901234', 150.00, 299.00, 25, 5, 'قطعة', true),
('Fresh Milk 1L', 'حليب طازج 1 لتر', 'MILK-1L', '3456789012345', 3.00, 6.00, 50, 10, 'علبة', true),
('Laptop HP Pavilion', 'لابتوب اتش بي بافيليون', 'HP-PAVILION', '4567890123456', 1500.00, 2500.00, 8, 3, 'قطعة', true),
('Arabic Coffee 250g', 'قهوة عربية 250 جرام', 'COFFEE-AR', '5678901234567', 15.00, 35.00, 30, 5, 'علبة', true),
('iPhone 15 Case', 'جراب آيفون 15', 'IPHONE-CASE', '6789012345678', 25.00, 65.00, 40, 8, 'قطعة', true),
('Bread White', 'خبز أبيض', 'BREAD-WHITE', '7890123456789', 1.00, 2.50, 200, 50, 'رغيف', true),
('Dell Mouse Wireless', 'فأرة ديل لاسلكية', 'DELL-MOUSE', '8901234567890', 45.00, 89.00, 15, 5, 'قطعة', true),
('Orange Juice 1L', 'عصير برتقال 1 لتر', 'JUICE-ORANGE', '9012345678901', 4.00, 8.50, 60, 15, 'علبة', true),
('T-Shirt Cotton XL', 'تيشيرت قطني مقاس XL', 'TSHIRT-XL', '0123456789012', 20.00, 45.00, 35, 10, 'قطعة', true);

-- Sample Customers
INSERT INTO customers (name, phone, email, customer_type, credit_limit, current_balance) VALUES
('أحمد محمد علي', '0501234567', 'ahmed@email.com', 'regular', 1000.00, 0.00),
('فاطمة عبدالله', '0507654321', 'fatima@email.com', 'vip', 5000.00, 150.00),
('مؤسسة النور التجارية', '0551234567', 'alnoor@company.com', 'wholesale', 20000.00, 2500.00),
('خالد سعد', '0509876543', 'khalid@email.com', 'regular', 2000.00, 0.00),
('شركة الأمل للمقاولات', '0558765432', 'alamal@company.com', 'wholesale', 50000.00, 12000.00),
('نورا حسن', '0502468135', 'nora@email.com', 'vip', 3000.00, 0.00),
('محمد عبدالعزيز', '0556789012', 'mohammed@email.com', 'regular', 1500.00, 75.00),
('مطعم البيت الشامي', '0503691472', 'restaurant@email.com', 'wholesale', 10000.00, 800.00);

-- Sample Suppliers
INSERT INTO suppliers (name, contact_person, phone, email, current_balance) VALUES
('شركة المشروبات الوطنية', 'سعد الأحمد', '0112345678', 'national.beverages@company.com', 5000.00),
('مؤسسة التقنية المتطورة', 'فهد العتيبي', '0113456789', 'advanced.tech@company.com', 25000.00),
('مزارع الحليب الطازج', 'عبدالله القحطاني', '0114567890', 'fresh.dairy@company.com', 1200.00),
('شركة الأجهزة الذكية', 'نوف الشمري', '0115678901', 'smart.devices@company.com', 18000.00),
('محمصة القهوة العربية', 'محمد البلوي', '0116789012', 'arabic.coffee@company.com', 800.00);