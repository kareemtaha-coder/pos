import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  QrCodeIcon, 
  UserIcon, 
  XMarkIcon, 
  ClockIcon, 
  ArrowUturnLeftIcon, 
  DocumentTextIcon,
  BanknotesIcon 
} from '@heroicons/react/24/outline';
import { usePOS } from '../../contexts/POSContext';
import { Product, Customer } from '../../types';
import { supabase } from '../../lib/supabase';
import Cart from './Cart';
import ProductGrid from './ProductGrid';
import QuickQuantityModal from './QuickQuantityModal';
import CustomerSelector from './CustomerSelector';
import PaymentModal from './PaymentModal';
import HoldSalesModal from './HoldSalesModal';
import ReturnModal from './ReturnModal';
import QuotationModal from './QuotationModal';
import CashRegisterModal from './CashRegisterModal';

const SalesInterface: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showCashRegisterModal, setShowCashRegisterModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, customer, addToCart, setCustomer } = usePOS();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  const handleBarcodeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm) {
      const product = products.find(p => p.barcode === searchTerm);
      if (product) {
        addToCart(product, 1);
        setSearchTerm('');
      }
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowQuantityModal(true);
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
    }
    setShowQuantityModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Main Sales Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">شاشة البيع</h2>
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* Action Buttons */}
              <button
                onClick={() => setShowCashRegisterModal(true)}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
              >
                <BanknotesIcon className="w-5 h-5 ml-1" />
                الصندوق
              </button>
              
              <button
                onClick={() => setShowQuotationModal(true)}
                disabled={cart.length === 0}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              >
                <DocumentTextIcon className="w-5 h-5 ml-1" />
                عرض سعر
              </button>
              
              <button
                onClick={() => setShowReturnModal(true)}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
              >
                <ArrowUturnLeftIcon className="w-5 h-5 ml-1" />
                إرجاع
              </button>
              
              <button
                onClick={() => setShowHoldModal(true)}
                className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center"
              >
                <ClockIcon className="w-5 h-5 ml-1" />
                تعليق
              </button>

              {customer && (
                <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                  <UserIcon className="w-5 h-5 text-blue-600 ml-2" />
                  <span className="text-blue-800 font-medium">{customer.name}</span>
                  <button
                    onClick={() => setCustomer(null)}
                    className="mr-2 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowCustomerModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                اختيار عميل
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleBarcodeSearch}
              className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="البحث بالاسم، الكود، أو الباركود..."
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <QrCodeIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto p-4">
          <ProductGrid 
            products={filteredProducts} 
            loading={loading}
            onProductSelect={handleProductSelect}
          />
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white shadow-lg border-r border-gray-200">
        <Cart onCheckout={() => setShowPaymentModal(true)} />
      </div>

      {/* Modals */}
      {showQuantityModal && selectedProduct && (
        <QuickQuantityModal
          product={selectedProduct}
          onClose={() => {
            setShowQuantityModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleQuantityConfirm}
        />
      )}

      {showCustomerModal && (
        <CustomerSelector
          onClose={() => setShowCustomerModal(false)}
          onSelectCustomer={(customer) => {
            setCustomer(customer);
            setShowCustomerModal(false);
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {showHoldModal && (
        <HoldSalesModal
          onClose={() => setShowHoldModal(false)}
        />
      )}

      {showReturnModal && (
        <ReturnModal
          onClose={() => setShowReturnModal(false)}
        />
      )}

      {showQuotationModal && (
        <QuotationModal
          onClose={() => setShowQuotationModal(false)}
        />
      )}

      {showCashRegisterModal && (
        <CashRegisterModal
          onClose={() => setShowCashRegisterModal(false)}
        />
      )}
    </div>
  );
};

export default SalesInterface;