import React from 'react';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  UsersIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { signOut, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: HomeIcon },
    { id: 'sales', label: 'المبيعات', icon: ShoppingCartIcon },
    { id: 'inventory', label: 'المخزون', icon: CubeIcon },
    { id: 'customers', label: 'العملاء', icon: UsersIcon },
    { id: 'reports', label: 'التقارير', icon: ChartBarIcon },
    { id: 'settings', label: 'الإعدادات', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">نظام نقطة البيع</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.user_metadata?.full_name}</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-6 py-3 text-right hover:bg-blue-50 transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                    : 'text-gray-700 hover:text-blue-700'
                }`}
              >
                <Icon className="w-5 h-5 ml-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <button
            onClick={signOut}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 ml-2" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;