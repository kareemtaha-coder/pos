import React from 'react';
import { usePOS } from '../../contexts/POSContext';
import { MinusIcon, PlusIcon, TrashIcon, TagIcon, PercentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CartProps {
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    discountAmount,
    discountPercentage,
    setDiscountAmount,
    setDiscountPercentage,
    customer
  } = usePOS();

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  return (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">سلة المشتريات</h3>
        <p className="text-sm text-gray-600">
          {cart.length} منتج
        </p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TagIcon className="w-8 h-8" />
            </div>
            <p className="text-center">السلة فارغة</p>
            <p className="text-sm text-center">أضف منتجات للبدء في البيع</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.product.name_ar}</h4>
                  <p className="text-sm text-gray-500">{item.product.sku}</p>
                  <p className="text-xs text-gray-400">{item.unit_price.toFixed(2)} ر.س × {item.quantity}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateCartItemQuantity(item.product.id, Number(e.target.value))}
                    className="w-16 text-center font-medium border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                  <button
                    onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock_quantity}
                    className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">
                    {item.total_price.toFixed(2)} ر.س
                  </p>
                  {item.discount_amount > 0 && (
                    <p className="text-xs text-red-500">
                      خصم: -{item.discount_amount.toFixed(2)} ر.س
                    </p>
                  )}
                </div>
              </div>
              
              {/* Item Discount */}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="number"
                    value={item.discount_amount}
                    onChange={(e) => {
                      // Update item discount logic would go here
                      console.log('Item discount:', e.target.value);
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    placeholder="خصم الصنف"
                  />
                  <span className="text-xs text-gray-500">ر.س</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Discount Section */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          <h4 className="font-medium text-gray-800">الخصومات</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">خصم ثابت</label>
              <div className="relative">
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="0.00"
                />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">ر.س</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">خصم نسبة</label>
              <div className="relative">
                <input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="0"
                  max="100"
                />
                <PercentIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">المجموع الفرعي:</span>
              <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
            </div>
            {(discountAmount > 0 || discountPercentage > 0) && (
              <div className="flex justify-between text-sm text-red-600">
                <span>الخصم:</span>
                <span>-{(discountAmount + (subtotal * discountPercentage / 100)).toFixed(2)} ر.س</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">الضريبة (15%):</span>
              <span className="font-medium">{tax.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>الإجمالي:</span>
              <span className="text-blue-600">{total.toFixed(2)} ر.س</span>
            </div>
          </div>
          
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            إتمام البيع
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;