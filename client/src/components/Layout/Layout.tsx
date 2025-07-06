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
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
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