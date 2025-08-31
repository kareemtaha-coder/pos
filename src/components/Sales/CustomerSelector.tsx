import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { supabase } from '../../lib/supabase';
import { MagnifyingGlassIcon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface CustomerSelectorProps {
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ onClose, onSelectCustomer }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    customer_type: 'regular' as const,
    credit_limit: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...newCustomer,
          current_balance: 0
        })
        .select()
        .single();

      if (error) throw error;
      
      setCustomers([...customers, data]);
      setShowAddForm(false);
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        customer_type: 'regular',
        credit_limit: 0
      });
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">اختيار العميل</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Add */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4 space-x-reverse">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="البحث بالاسم أو رقم الهاتف..."
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
            >
              <UserPlusIcon className="w-5 h-5 ml-1" />
              عميل جديد
            </button>
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>لا توجد عملاء</p>
              <p className="text-sm">قم بإضافة عميل جديد أو تعديل البحث</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{customer.name}</h4>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        customer.customer_type === 'vip' ? 'bg-purple-100 text-purple-800' :
                        customer.customer_type === 'wholesale' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.customer_type === 'vip' ? 'مميز' :
                         customer.customer_type === 'wholesale' ? 'جملة' : 'عادي'}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">الرصيد</p>
                      <p className={`font-medium ${
                        customer.current_balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {customer.current_balance.toFixed(2)} ر.س
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Customer Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">إضافة عميل جديد</h4>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم العميل"
                  required
                />
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="رقم الهاتف"
                />
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="البريد الإلكتروني"
                />
                <select
                  value={newCustomer.customer_type}
                  onChange={(e) => setNewCustomer({ ...newCustomer, customer_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="regular">عادي</option>
                  <option value="wholesale">جملة</option>
                  <option value="vip">مميز</option>
                </select>
                <input
                  type="number"
                  value={newCustomer.credit_limit}
                  onChange={(e) => setNewCustomer({ ...newCustomer, credit_limit: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="حد الائتمان"
                />
              </div>
              
              <div className="flex space-x-3 space-x-reverse mt-6">
                <button
                  onClick={addNewCustomer}
                  disabled={!newCustomer.name}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSelector;