import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { POSProvider } from './contexts/POSContext';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import SalesInterface from './components/Sales/SalesInterface';
import InventoryManagement from './components/Inventory/InventoryManagement';
import CustomerManagement from './components/Customers/CustomerManagement';
import Reports from './components/Reports/Reports';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <SalesInterface />;
      case 'inventory':
        return <InventoryManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return (
          <div className="p-6" dir="rtl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">الإعدادات</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">صفحة الإعدادات قيد التطوير...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <POSProvider>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
    </POSProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;