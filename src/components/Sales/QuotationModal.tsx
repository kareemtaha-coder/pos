import React, { useState } from 'react';
import { usePOS } from '../../contexts/POSContext';
import { XMarkIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface QuotationModalProps {
  onClose: () => void;
}

const QuotationModal: React.FC<QuotationModalProps> = ({ onClose }) => {
  const { cart, customer, calculateSubtotal, calculateTax, calculateTotal } = usePOS();
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [quotationGenerated, setQuotationGenerated] = useState(false);
  const [quotationNumber, setQuotationNumber] = useState('');

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  const generateQuotation = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة');
      return;
    }

    setProcessing(true);

    try {
      const quotationNum = `QUO-${Date.now()}`;
      
      // Create quotation record
      const { data: quotationData, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          quotation_number: quotationNum,
          customer_id: customer?.id,
          subtotal,
          tax_amount: tax,
          total_amount: total,
          valid_until: validUntil,
          notes,
          status: 'pending'
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Create quotation items
      const quotationItems = cart.map(item => ({
        quotation_id: quotationData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(quotationItems);

      if (itemsError) throw itemsError;

      setQuotationNumber(quotationNum);
      setQuotationGenerated(true);
    } catch (error) {
      console.error('Error generating quotation:', error);
      alert('فشل في إنشاء عرض السعر');
    } finally {
      setProcessing(false);
    }
  };

  if (quotationGenerated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" dir="rtl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">تم إنشاء عرض السعر</h3>
            <p className="text-gray-600 mb-6">رقم العرض: {quotationNumber}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => alert('تم إرسال عرض السعر للطباعة')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <PrinterIcon className="w-5 h-5 ml-2" />
                طباعة عرض السعر
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">إنشاء عرض سعر</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-auto">
          {/* Customer Info */}
          {customer && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">بيانات العميل</h4>
              <p className="text-blue-700">{customer.name}</p>
              <p className="text-sm text-blue-600">{customer.phone}</p>
            </div>
          )}

          {/* Cart Items */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3">الأصناف</h4>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-800">{item.product.name_ar}</h5>
                    <p className="text-sm text-gray-600">{item.product.sku}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{item.total_price.toFixed(2)} ر.س</p>
                    <p className="text-sm text-gray-600">{item.quantity} × {item.unit_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quotation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صالح حتى تاريخ
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ملاحظات إضافية..."
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي:</span>
                <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الضريبة (15%):</span>
                <span className="font-medium">{tax.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>الإجمالي:</span>
                <span className="text-blue-600">{total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              إلغاء
            </button>
            <button
              onClick={generateQuotation}
              disabled={processing || cart.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <DocumentTextIcon className="w-5 h-5 ml-2" />
              {processing ? 'جارٍ الإنشاء...' : 'إنشاء عرض السعر'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationModal;