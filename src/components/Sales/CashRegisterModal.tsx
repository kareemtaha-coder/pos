import React, { useState, useEffect } from 'react';
import { XMarkIcon, BanknotesIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface CashRegisterModalProps {
  onClose: () => void;
}

interface CashTransaction {
  id: string;
  type: 'opening' | 'closing' | 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  created_at: string;
}

const CashRegisterModal: React.FC<CashRegisterModalProps> = ({ onClose }) => {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCashRegisterData();
  }, []);

  const fetchCashRegisterData = async () => {
    try {
      // Get today's transactions
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('cash_register_transactions')
        .select('*')
        .gte('created_at', today + 'T00:00:00.000Z')
        .lte('created_at', today + 'T23:59:59.999Z')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      
      // Calculate current balance
      const balance = (data || []).reduce((sum, transaction) => {
        return transaction.type === 'deposit' || transaction.type === 'opening'
          ? sum + transaction.amount
          : sum - transaction.amount;
      }, 0);
      
      setCurrentBalance(balance);
    } catch (error) {
      console.error('Error fetching cash register data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async () => {
    if (!amount || Number(amount) <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    try {
      const { error } = await supabase
        .from('cash_register_transactions')
        .insert({
          type: transactionType,
          amount: Number(amount),
          description: description || (transactionType === 'deposit' ? 'إيداع نقدي' : 'سحب نقدي')
        });

      if (error) throw error;

      setAmount('');
      setDescription('');
      fetchCashRegisterData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('فشل في إضافة العملية');
    }
  };

  const openRegister = async () => {
    const openingAmount = prompt('مبلغ فتح الصندوق:');
    if (openingAmount && Number(openingAmount) >= 0) {
      try {
        const { error } = await supabase
          .from('cash_register_transactions')
          .insert({
            type: 'opening',
            amount: Number(openingAmount),
            description: 'فتح الصندوق'
          });

        if (error) throw error;
        fetchCashRegisterData();
      } catch (error) {
        console.error('Error opening register:', error);
        alert('فشل في فتح الصندوق');
      }
    }
  };

  const closeRegister = async () => {
    if (confirm('هل أنت متأكد من إغلاق الصندوق؟')) {
      try {
        const { error } = await supabase
          .from('cash_register_transactions')
          .insert({
            type: 'closing',
            amount: currentBalance,
            description: 'إغلاق الصندوق'
          });

        if (error) throw error;
        alert(`تم إغلاق الصندوق. الرصيد النهائي: ${currentBalance.toFixed(2)} ر.س`);
        onClose();
      } catch (error) {
        console.error('Error closing register:', error);
        alert('فشل في إغلاق الصندوق');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">إدارة الصندوق</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Current Balance */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center">
            <BanknotesIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <h4 className="text-lg font-medium text-blue-800 mb-1">رصيد الصندوق الحالي</h4>
            <p className="text-3xl font-bold text-blue-600">{currentBalance.toFixed(2)} ر.س</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={openRegister}
              className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              فتح الصندوق
            </button>
            <button
              onClick={closeRegister}
              className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              إغلاق الصندوق
            </button>
          </div>

          {/* Add Transaction */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-3">إضافة عملية</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع العملية</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="deposit">إيداع</option>
                  <option value="withdrawal">سحب</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="وصف العملية..."
              />
            </div>
            <button
              onClick={addTransaction}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              {transactionType === 'deposit' ? (
                <PlusIcon className="w-5 h-5 ml-1" />
              ) : (
                <MinusIcon className="w-5 h-5 ml-1" />
              )}
              إضافة العملية
            </button>
          </div>

          {/* Transactions List */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">عمليات اليوم</h4>
            <div className="max-h-64 overflow-auto">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد عمليات اليوم</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleTimeString('ar-SA')}
                        </p>
                      </div>
                      <div className="text-left">
                        <span className={`font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'opening'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'opening' ? '+' : '-'}
                          {transaction.amount.toFixed(2)} ر.س
                        </span>
                        <p className="text-xs text-gray-500">
                          {transaction.type === 'opening' ? 'فتح' :
                           transaction.type === 'closing' ? 'إغلاق' :
                           transaction.type === 'deposit' ? 'إيداع' : 'سحب'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashRegisterModal;