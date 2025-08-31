import React, { useState } from 'react';
import { usePOS } from '../../contexts/POSContext';
import { XMarkIcon, PrinterIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { PaymentMethod } from '../../types';

interface PaymentModalProps {
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose }) => {
  const { calculateTotal, processSale, customer } = usePOS();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { type: 'cash', amount: calculateTotal() }
  ]);
  const [processing, setProcessing] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const total = calculateTotal();
  const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
  const change = totalPaid - total;

  const updatePaymentAmount = (index: number, amount: number) => {
    const newMethods = [...paymentMethods];
    newMethods[index].amount = amount;
    setPaymentMethods(newMethods);
  };

  const addPaymentMethod = (type: PaymentMethod['type']) => {
    setPaymentMethods([...paymentMethods, { type, amount: 0 }]);
  };

  const removePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
  };

  const handleProcessSale = async () => {
    setProcessing(true);
    
    const result = await processSale(paymentMethods);
    
    if (result.success) {
      setInvoiceGenerated(true);
      setInvoiceId(result.invoiceId || null);
    } else {
      alert(result.error);
    }
    
    setProcessing(false);
  };

  const printInvoice = () => {
    // Simulate printing
    alert('تم إرسال الفاتورة للطباعة');
  };

  const sendInvoice = () => {
    // Simulate sending
    alert('تم إرسال الفاتورة بنجاح');
  };

  if (invoiceGenerated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" dir="rtl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">تم إتمام البيع بنجاح</h3>
            <p className="text-gray-600 mb-6">رقم الفاتورة: {invoiceId}</p>
            
            <div className="space-y-3">
              <button
                onClick={printInvoice}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <PrinterIcon className="w-5 h-5 ml-2" />
                طباعة الفاتورة
              </button>
              
              <button
                onClick={sendInvoice}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <DevicePhoneMobileIcon className="w-5 h-5 ml-2" />
                إرسال بالواتساب
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">طرق الدفع</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">الإجمالي:</span>
              <span className="font-bold text-xl text-blue-600">{total.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">المدفوع:</span>
              <span className="font-medium">{totalPaid.toFixed(2)} ر.س</span>
            </div>
            {change > 0 && (
              <div className="flex justify-between text-green-600">
                <span>الباقي:</span>
                <span className="font-medium">{change.toFixed(2)} ر.س</span>
              </div>
            )}
            {customer && (
              <div className="flex justify-between text-blue-600">
                <span>العميل:</span>
                <span className="font-medium">{customer.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 overflow-auto">
          <h4 className="font-medium text-gray-800 mb-4">طرق الدفع</h4>
          
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center space-x-3 space-x-reverse">
                <select
                  value={method.type}
                  onChange={(e) => {
                    const newMethods = [...paymentMethods];
                    newMethods[index].type = e.target.value as PaymentMethod['type'];
                    setPaymentMethods(newMethods);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">نقدي</option>
                  <option value="card">بطاقة</option>
                  <option value="credit">آجل</option>
                </select>
                
                <input
                  type="number"
                  value={method.amount}
                  onChange={(e) => updatePaymentAmount(index, Number(e.target.value))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="المبلغ"
                />
                
                {paymentMethods.length > 1 && (
                  <button
                    onClick={() => removePaymentMethod(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex space-x-2 space-x-reverse mt-4">
            <button
              onClick={() => addPaymentMethod('cash')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              + نقدي
            </button>
            <button
              onClick={() => addPaymentMethod('card')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              + بطاقة
            </button>
            <button
              onClick={() => addPaymentMethod('credit')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              + آجل
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              إلغاء
            </button>
            <button
              onClick={handleProcessSale}
              disabled={processing || totalPaid < 0}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {processing ? 'جارٍ المعالجة...' : 'إتمام البيع'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;