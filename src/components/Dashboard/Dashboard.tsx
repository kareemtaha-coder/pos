import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  CubeIcon, 
  UsersIcon, 
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DashboardStats {
  todaySales: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  pendingPayments: number;
  totalRevenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    pendingPayments: 0,
    totalRevenue: 0
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get today's sales
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySalesData } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', today + 'T00:00:00.000Z')
        .lte('created_at', today + 'T23:59:59.999Z');

      const todaySales = todaySalesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Get low stock products
      const { data: lowStockData } = await supabase
        .from('products')
        .select('stock_quantity, min_stock_level')
        .filter('stock_quantity', 'lte', 'min_stock_level');

      // Get pending payments
      const { data: pendingData } = await supabase
        .from('customers')
        .select('current_balance')
        .gt('current_balance', 0);

      const pendingPayments = pendingData?.reduce((sum, customer) => sum + customer.current_balance, 0) || 0;

      // Get total revenue (this month)
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: monthlyRevenueData } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', firstDayOfMonth);

      const totalRevenue = monthlyRevenueData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

      // Get recent sales
      const { data: recentSalesData } = await supabase
        .from('sales')
        .select(`
          *,
          customers (name),
          sale_items (
            quantity,
            products (name_ar)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        todaySales,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        lowStockCount: lowStockData?.length || 0,
        pendingPayments,
        totalRevenue
      });

      setRecentSales(recentSalesData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'مبيعات اليوم',
      value: `${stats.todaySales.toFixed(2)} ر.س`,
      icon: ShoppingCartIcon,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts.toString(),
      icon: CubeIcon,
      color: 'green',
      change: '+3%'
    },
    {
      title: 'العملاء',
      value: stats.totalCustomers.toString(),
      icon: UsersIcon,
      color: 'purple',
      change: '+8%'
    },
    {
      title: 'نواقص المخزون',
      value: stats.lowStockCount.toString(),
      icon: ExclamationTriangleIcon,
      color: 'red',
      isAlert: true
    },
    {
      title: 'المدفوعات المعلقة',
      value: `${stats.pendingPayments.toFixed(2)} ر.س`,
      icon: BanknotesIcon,
      color: 'orange',
      isAlert: true
    },
    {
      title: 'إيرادات الشهر',
      value: `${stats.totalRevenue.toFixed(2)} ر.س`,
      icon: ChartBarIcon,
      color: 'indigo',
      change: '+25%'
    }
  ];

  if (loading) {
    return (
      <div className="p-6" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">لوحة التحكم</h2>
        <p className="text-gray-600">
          {format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 ${
                stat.isAlert ? 'border-r-4 border-red-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' :
                  stat.color === 'red' ? 'bg-red-100' :
                  stat.color === 'orange' ? 'bg-orange-100' :
                  'bg-indigo-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    stat.color === 'orange' ? 'text-orange-600' :
                    'text-indigo-600'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">المبيعات الأخيرة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  رقم الفاتورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  طريقة الدفع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {sale.invoice_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {sale.customers?.name || 'عميل مباشر'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {sale.total_amount.toFixed(2)} ر.س
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {sale.payment_method === 'cash' ? 'نقدي' :
                     sale.payment_method === 'card' ? 'بطاقة' :
                     sale.payment_method === 'credit' ? 'آجل' : 'جزئي'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(sale.created_at), 'HH:mm - dd/MM/yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;