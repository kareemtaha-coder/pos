import React, { useState } from 'react';
import { Product } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface QuickQuantityModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}

const QuickQuantityModal: React.FC<QuickQuantityModalProps> = ({ product, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(quantity);
  };

  const quickQuantities = [1, 2, 5, 10, 20, 50];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">تحديد الكمية</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">{product.name_ar}</h4>
          <p className="text-sm text-gray-600">المتوفر: {product.stock_quantity} {product.unit}</p>
          <p className="text-sm text-blue-600 font-medium">{product.selling_price.toFixed(2)} ر.س</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الكمية
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              max={product.stock_quantity}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-medium"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {quickQuantities.map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantity(qty)}
                disabled={qty > product.stock_quantity}
                className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {qty}
              </button>
            ))}
          </div>

          <div className="flex space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              إضافة للسلة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickQuantityModal;