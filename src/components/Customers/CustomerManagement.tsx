import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { supabase } from '../../lib/supabase';
import { 
  PlusIcon, 
  PencilIcon, 
  EyeIcon, 
  MagnifyingGlassIcon, 
  UsersIcon,
  DocumentTextIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import CustomerForm from './CustomerForm';
import CustomerStatementModal from './CustomerStatementModal';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm)) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(customer => {
    if (filterType === 'vip') return customer.customer_type === 'vip';
    if (filterType === 'wholesale') return customer.customer_type === 'wholesale';
    if (filterType === 'with_balance') return customer.current_balance > 0;
    return true;
  });

  const totalBalance = customers.reduce((sum, customer) => sum + customer.current_balance, 0);
  const vipCustomers = customers.filter(c => c.customer_type === 'vip').length;
  const wholesaleCustomers = customers.filter(c => c.customer_type === 'wholesale').length;
  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة العملاء</h2>
          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
            <span>إجمالي: {customers.length}</span>
            <span>مميز: {vipCustomers}</span>
            <span>جملة: {wholesaleCustomers}</span>
            <span className="text-red-600">إجمالي الديون: {totalBalance.toFixed(2)} ر.س</span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="w-5 h-5 ml-1" />
          عميل جديد
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center space-x-4 space-x-reverse">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="البحث في العملاء..."
            />
          </div>
        </div>
        
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع العملاء</option>
            <option value="vip">عملاء مميزون</option>
            <option value="wholesale">عملاء جملة</option>
            <option value="with_balance">لديهم ديون</option>
          </select>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-2 space-x-reverse">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          ))
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-500">لا توجد عملاء</p>
            <p className="text-gray-400">قم بإضافة عملاء جدد لبدء العمل</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{customer.name}</h3>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  customer.customer_type === 'vip' ? 'bg-purple-100 text-purple-800' :
                  customer.customer_type === 'wholesale' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {customer.customer_type === 'vip' ? 'مميز' :
                   customer.customer_type === 'wholesale' ? 'جملة' : 'عادي'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الرصيد الحالي:</span>
                  <span className={`font-medium ${
                    customer.current_balance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {customer.current_balance.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">حد الائتمان:</span>
                  <span className="font-medium text-gray-800">
                    {customer.credit_limit.toFixed(2)} ر.س
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => {
                    setEditingCustomer(customer);
                    setShowForm(true);
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center text-sm"
                >
                  <PencilIcon className="w-4 h-4 ml-1" />
                  تعديل
                </button>
                <button 
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowStatementModal(true);
                  }}
                  className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center text-sm"
                >
                  <DocumentTextIcon className="w-4 h-4 ml-1" />
                  كشف حساب
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSave={() => {
            fetchCustomers();
            setShowForm(false);
            setEditingCustomer(null);
          }}
        />
      )}

      {/* Customer Statement Modal */}
      {showStatementModal && selectedCustomer && (
        <CustomerStatementModal
          customer={selectedCustomer}
          onClose={() => {
            setShowStatementModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerManagement;