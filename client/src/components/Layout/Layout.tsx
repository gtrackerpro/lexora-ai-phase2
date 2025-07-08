import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <Sidebar />
      <main className="ml-16 sm:ml-20 md:ml-24 lg:ml-64 overflow-auto p-4 md:p-6 pt-20 min-h-screen">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

// Also create a simple layout without sidebar for auth pages
export const SimpleLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;