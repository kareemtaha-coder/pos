import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentChartBarIcon, 
  CalendarIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const Reports: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalesReport();
  }, [dateRange, reportType]);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (name),
          sale_items (
            quantity,
            unit_price,
            total_price,
            products (name_ar, sku)
          )
        `)
        .gte('created_at', dateRange.startDate + 'T00:00:00.000Z')
        .lte('created_at', dateRange.endDate + 'T23:59:59.999Z')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSalesData(data || []);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = salesData.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalInvoices = salesData.length;
  const avgInvoiceValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;
  const cashSales = salesData.filter(s => s.payment_method === 'cash').reduce((sum, sale) => sum + sale.total_amount, 0);
  const creditSales = salesData.filter(s => s.payment_method === 'credit').reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">التقارير والتحليلات</h2>
        <p className="text-gray-600">تحليل أداء المبيعات والمخزون</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع التقرير
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
              <option value="custom">مخصص</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchSalesReport}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              تحديث التقرير
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-blue-600">{totalSales.toFixed(2)} ر.س</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عدد الفواتير</p>
              <p className="text-2xl font-bold text-green-600">{totalInvoices}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DocumentChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط الفاتورة</p>
              <p className="text-2xl font-bold text-purple-600">{avgInvoiceValue.toFixed(2)} ر.س</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المبيعات النقدية</p>
              <p className="text-2xl font-bold text-orange-600">{cashSales.toFixed(2)} ر.س</p>
              <p className="text-xs text-gray-500 mt-1">
                آجل: {creditSales.toFixed(2)} ر.س
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <CalendarIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">تفاصيل المبيعات</h3>
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
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  التاريخ
                </th>
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
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                  </tr>
                ))
              ) : salesData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا توجد مبيعات في الفترة المحددة
                  </td>
                </tr>
              ) : (
                salesData.map((sale) => (
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
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        sale.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sale.payment_status === 'paid' ? 'مدفوع' :
                         sale.payment_status === 'partial' ? 'جزئي' : 'معلق'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(sale.created_at), 'HH:mm - dd/MM/yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;