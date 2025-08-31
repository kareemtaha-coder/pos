import React from 'react';
import { Product } from '../../types';
import { PlusIcon, CubeIcon } from '@heroicons/react/24/outline';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductSelect: (product: Product, quantity?: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, onProductSelect }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <CubeIcon className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">لا توجد منتجات متاحة</p>
        <p className="text-sm">قم بإضافة منتجات أو تعديل البحث</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer"
          onClick={() => onProductSelect(product)}
        >
          <div className="relative">
            <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <CubeIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200">
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            {product.stock_quantity <= product.min_stock_level && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                نفدت الكمية
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">{product.name_ar}</h3>
            <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">
                {product.selling_price.toFixed(2)} ر.س
              </span>
              <span className="text-sm text-gray-500">
                المخزون: {product.stock_quantity}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;