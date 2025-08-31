import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface StockAdjustmentModalProps {
  onClose: () => void;
  onComplete: () => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ onClose, onComplete }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<{[key: string]: { type: 'add' | 'subtract', quantity: number, reason: string }}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name_ar');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAdjustment = (productId: string, field: string, value: any) => {
    setAdjustments(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const processAdjustments = async () => {
    const adjustmentEntries = Object.entries(adjustments).filter(([_, adj]) => adj.quantity > 0);
    
    if (adjustmentEntries.length === 0) {
      alert('لا توجد تعديلات للمعالجة');
      return;
    }

    setProcessing(true);

    try {
      for (const [productId, adjustment] of adjustmentEntries) {
        const product = products.find(p => p.id === productId);
        if (!product) continue;

        const newQuantity = adjustment.type === 'add' 
          ? product.stock_quantity + adjustment.quantity
          : product.stock_quantity - adjustment.quantity;

        if (newQuantity < 0) {
          alert(`لا يمكن أن تكون الكمية سالبة للمنتج: ${product.name_ar}`);
          continue;
        }

        // Update product stock
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: newQuantity })
          .eq('id', productId);

        if (updateError) throw updateError;

        // Log the adjustment
        const { error: logError } = await supabase
          .from('stock_adjustments')
          .insert({
            product_id: productId,
            adjustment_type: adjustment.type,
            quantity: adjustment.quantity,
            reason: adjustment.reason || 'تسوية مخزون',
            old_quantity: product.stock_quantity,
            new_quantity: newQuantity
          });

        if (logError) throw logError;
      }

      alert('تم تحديث المخزون بنجاح');
      onComplete();
    } catch (error) {
      console.error('Error processing adjustments:', error);
      alert('فشل في تحديث المخزون');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">تسوية المخزون</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="البحث في المنتجات..."
              />
            </div>
          </div>

          {/* Products List */}
          <div className="max-h-96 overflow-auto mb-6">
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">{product.name_ar}</h4>
                      <p className="text-sm text-gray-600">{product.sku}</p>
                      <p className="text-sm text-blue-600">المخزون الحالي: {product.stock_quantity} {product.unit}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">نوع التعديل</label>
                      <select
                        value={adjustments[product.id]?.type || 'add'}
                        onChange={(e) => updateAdjustment(product.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="add">إضافة</option>
                        <option value="subtract">خصم</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">الكمية</label>
                      <input
                        type="number"
                        value={adjustments[product.id]?.quantity || ''}
                        onChange={(e) => updateAdjustment(product.id, 'quantity', Number(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">السبب</label>
                      <input
                        type="text"
                        value={adjustments[product.id]?.reason || ''}
                        onChange={(e) => updateAdjustment(product.id, 'reason', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="سبب التعديل..."
                      />
                    </div>
                  </div>

                  {adjustments[product.id]?.quantity > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <p className="text-blue-800">
                        الكمية الجديدة: {
                          adjustments[product.id].type === 'add'
                            ? product.stock_quantity + adjustments[product.id].quantity
                            : product.stock_quantity - adjustments[product.id].quantity
                        } {product.unit}
                      </p>
                    </div>
                  )}
                </div>
              ))}
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
              onClick={processAdjustments}
              disabled={processing || Object.values(adjustments).every(adj => !adj.quantity || adj.quantity === 0)}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {processing ? 'جارٍ المعالجة...' : 'تطبيق التعديلات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;