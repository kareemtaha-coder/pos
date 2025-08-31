import React, { useState, useEffect } from 'react';
import { usePOS } from '../../contexts/POSContext';
import { XMarkIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';

interface HeldSale {
  id: string;
  name: string;
  items: any[];
  customer?: any;
  total: number;
  timestamp: Date;
}

interface HoldSalesModalProps {
  onClose: () => void;
}

const HoldSalesModal: React.FC<HoldSalesModalProps> = ({ onClose }) => {
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [holdName, setHoldName] = useState('');
  const { cart, customer, calculateTotal, clearCart, addToCart, setCustomer } = usePOS();

  useEffect(() => {
    loadHeldSales();
  }, []);

  const loadHeldSales = () => {
    const saved = localStorage.getItem('heldSales');
    if (saved) {
      const parsed = JSON.parse(saved);
      setHeldSales(parsed.map((sale: any) => ({
        ...sale,
        timestamp: new Date(sale.timestamp)
      })));
    }
  };

  const saveHeldSales = (sales: HeldSale[]) => {
    localStorage.setItem('heldSales', JSON.stringify(sales));
    setHeldSales(sales);
  };

  const holdCurrentSale = () => {
    if (cart.length === 0) return;

    const newHeldSale: HeldSale = {
      id: Date.now().toString(),
      name: holdName || `فاتورة ${new Date().toLocaleTimeString('ar-SA')}`,
      items: cart,
      customer,
      total: calculateTotal(),
      timestamp: new Date()
    };

    const updatedSales = [...heldSales, newHeldSale];
    saveHeldSales(updatedSales);
    clearCart();
    setHoldName('');
    onClose();
  };

  const recallSale = (sale: HeldSale) => {
    clearCart();
    sale.items.forEach(item => {
      addToCart(item.product, item.quantity);
    });
    if (sale.customer) {
      setCustomer(sale.customer);
    }
    
    // Remove from held sales
    const updatedSales = heldSales.filter(s => s.id !== sale.id);
    saveHeldSales(updatedSales);
    onClose();
  };

  const deleteSale = (saleId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة المعلقة؟')) {
      const updatedSales = heldSales.filter(s => s.id !== saleId);
      saveHeldSales(updatedSales);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">الفواتير المعلقة</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Hold Current Sale */}
        {cart.length > 0 && (
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h4 className="font-medium text-gray-800 mb-3">تعليق الفاتورة الحالية</h4>
            <div className="flex space-x-3 space-x-reverse">
              <input
                type="text"
                value={holdName}
                onChange={(e) => setHoldName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اسم الفاتورة (اختياري)"
              />
              <button
                onClick={holdCurrentSale}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                تعليق
              </button>
            </div>
          </div>
        )}

        {/* Held Sales List */}
        <div className="flex-1 overflow-auto p-6">
          {heldSales.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ClockIcon className="w-12 h-12 mx-auto mb-4" />
              <p>لا توجد فواتير معلقة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {heldSales.map((sale) => (
                <div
                  key={sale.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{sale.name}</h4>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => recallSale(sale)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200"
                      >
                        استرجاع
                      </button>
                      <button
                        onClick={() => deleteSale(sale.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>العدد: {sale.items.length} منتج</p>
                    <p>العميل: {sale.customer?.name || 'عميل مباشر'}</p>
                    <p>المبلغ: {sale.total.toFixed(2)} ر.س</p>
                    <p>الوقت: {sale.timestamp.toLocaleString('ar-SA')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoldSalesModal;