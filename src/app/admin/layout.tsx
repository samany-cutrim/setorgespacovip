import React from 'react';
import Sidebar from '@/components/shared/Sidebar';
import Header from '@/components/shared/Header';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-800 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
