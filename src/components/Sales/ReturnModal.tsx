import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { XMarkIcon, MagnifyingGlassIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

interface ReturnModalProps {
  onClose: () => void;
}

interface SaleForReturn {
  id: string;
  invoice_number: string;
  customer_name?: string;
  total_amount: number;
  created_at: string;
  sale_items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name_ar: string;
      sku: string;
    };
  }>;
}

const ReturnModal: React.FC<ReturnModalProps> = ({ onClose }) => {
  const [sales, setSales] = useState<SaleForReturn[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleForReturn | null>(null);
  const [returnItems, setReturnItems] = useState<{[key: string]: number}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRecentSales();
  }, []);

  const fetchRecentSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          invoice_number,
          total_amount,
          created_at,
          customers (name),
          sale_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            products (name_ar, sku)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const formattedSales = data?.map(sale => ({
        ...sale,
        customer_name: sale.customers?.name
      })) || [];
      
      setSales(formattedSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReturn = async () => {
    if (!selectedSale) return;
    
    setProcessing(true);
    
    try {
      const returnItemsArray = Object.entries(returnItems)
        .filter(([_, quantity]) => quantity > 0)
        .map(([itemId, quantity]) => {
          const saleItem = selectedSale.sale_items.find(item => item.id === itemId);
          return {
            sale_item_id: itemId,
            product_id: saleItem?.product_id,
            quantity,
            unit_price: saleItem?.unit_price || 0,
            total_price: quantity * (saleItem?.unit_price || 0)
          };
        });

      if (returnItemsArray.length === 0) {
        alert('يرجى تحديد الأصناف المراد إرجاعها');
        return;
      }

      // Create return record
      const returnTotal = returnItemsArray.reduce((sum, item) => sum + item.total_price, 0);
      
      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .insert({
          original_sale_id: selectedSale.id,
          return_amount: returnTotal,
          reason: 'عودة عميل',
          status: 'completed'
        })
        .select()
        .single();

      if (returnError) throw returnError;

      // Update inventory
      for (const returnItem of returnItemsArray) {
        if (returnItem.product_id) {
          const { error: stockError } = await supabase.rpc('increment_stock', {
            product_id: returnItem.product_id,
            quantity: returnItem.quantity
          });

          if (stockError) throw stockError;
        }
      }

      alert('تم إرجاع الأصناف بنجاح');
      onClose();
    } catch (error) {
      console.error('Error processing return:', error);
      alert('فشل في معالجة الإرجاع');
    } finally {
      setProcessing(false);
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">إرجاع المبيعات</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sales List */}
          <div className="w-1/2 border-l border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="البحث برقم الفاتورة أو اسم العميل..."
                />
              </div>
            </div>

            <div className="overflow-auto h-full p-4">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSales.map((sale) => (
                    <div
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedSale?.id === sale.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{sale.invoice_number}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(sale.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{sale.customer_name || 'عميل مباشر'}</p>
                      <p className="text-sm font-medium text-blue-600">{sale.total_amount.toFixed(2)} ر.س</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Return Items */}
          <div className="w-1/2">
            {selectedSale ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800">أصناف الفاتورة</h4>
                  <p className="text-sm text-gray-600">{selectedSale.invoice_number}</p>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <div className="space-y-3">
                    {selectedSale.sale_items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-gray-800">{item.products.name_ar}</h5>
                            <p className="text-sm text-gray-600">{item.products.sku}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-gray-600">الكمية الأصلية: {item.quantity}</p>
                            <p className="text-sm font-medium">{item.total_price.toFixed(2)} ر.س</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <label className="text-sm text-gray-600">كمية الإرجاع:</label>
                          <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={returnItems[item.id] || 0}
                            onChange={(e) => setReturnItems({
                              ...returnItems,
                              [item.id]: Number(e.target.value)
                            })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-3 space-x-reverse">
                    <button
                      onClick={onClose}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={processReturn}
                      disabled={processing || Object.values(returnItems).every(qty => qty === 0)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                    >
                      <ArrowUturnLeftIcon className="w-5 h-5 ml-1" />
                      {processing ? 'جارٍ المعالجة...' : 'إرجاع الأصناف'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <ArrowUturnLeftIcon className="w-12 h-12 mx-auto mb-4" />
                  <p>اختر فاتورة لإرجاع أصنافها</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;