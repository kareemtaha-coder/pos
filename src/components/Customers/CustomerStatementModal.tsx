import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { supabase } from '../../lib/supabase';
import { XMarkIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface CustomerStatementModalProps {
  customer: Customer;
  onClose: () => void;
}

interface Transaction {
  id: string;
  type: 'sale' | 'payment' | 'return';
  amount: number;
  description: string;
  invoice_number?: string;
  created_at: string;
}

const CustomerStatementModal: React.FC<CustomerStatementModalProps> = ({ customer, onClose }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerTransactions();
  }, [dateRange]);

  const fetchCustomerTransactions = async () => {
    try {
      // Get sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, invoice_number, total_amount, created_at')
        .eq('customer_id', customer.id)
        .gte('created_at', dateRange.startDate + 'T00:00:00.000Z')
        .lte('created_at', dateRange.endDate + 'T23:59:59.999Z');

      if (salesError) throw salesError;

      // Get payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('customer_payments')
        .select('id, amount, description, created_at')
        .eq('customer_id', customer.id)
        .gte('created_at', dateRange.startDate + 'T00:00:00.000Z')
        .lte('created_at', dateRange.endDate + 'T23:59:59.999Z');

      if (paymentsError) throw paymentsError;

      // Combine and format transactions
      const allTransactions: Transaction[] = [
        ...(salesData || []).map(sale => ({
          id: sale.id,
          type: 'sale' as const,
          amount: sale.total_amount,
          description: `فاتورة بيع`,
          invoice_number: sale.invoice_number,
          created_at: sale.created_at
        })),
        ...(paymentsData || []).map(payment => ({
          id: payment.id,
          type: 'payment' as const,
          amount: payment.amount,
          description: payment.description || 'دفعة',
          created_at: payment.created_at
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
  const totalPayments = transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalSales - totalPayments;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">كشف حساب العميل</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-blue-800">{customer.name}</h4>
              <p className="text-blue-600">{customer.phone}</p>
              <p className="text-blue-600">{customer.email}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-blue-600">الرصيد الحالي</p>
              <p className={`text-2xl font-bold ${
                customer.current_balance > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {customer.current_balance.toFixed(2)} ر.س
              </p>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1"></div>
            <button
              onClick={() => alert('تم إرسال كشف الحساب للطباعة')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <PrinterIcon className="w-5 h-5 ml-1" />
              طباعة
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">إجمالي المبيعات</p>
              <p className="text-xl font-bold text-blue-600">{totalSales.toFixed(2)} ر.س</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">إجمالي المدفوعات</p>
              <p className="text-xl font-bold text-green-600">{totalPayments.toFixed(2)} ر.س</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">صافي الرصيد</p>
              <p className={`text-xl font-bold ${netBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {netBalance.toFixed(2)} ر.س
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مدين</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">دائن</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    لا توجد معاملات في الفترة المحددة
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => {
                  let runningBalance = customer.current_balance;
                  // Calculate running balance (simplified)
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                        {transaction.invoice_number && (
                          <span className="block text-xs text-gray-500">{transaction.invoice_number}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">
                        {transaction.type === 'sale' ? transaction.amount.toFixed(2) : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">
                        {transaction.type === 'payment' ? transaction.amount.toFixed(2) : ''}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {runningBalance.toFixed(2)} ر.س
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerStatementModal;