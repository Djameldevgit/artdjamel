// components/layout/Layout.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

 
import Navbar from '../header/Navbar2';
import Sidebar from '../header/Drawer';
 
const Layout = ({ children }) => {
  const location = useLocation();
 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ocultar sidebar en algunas rutas
  const hideSidebarRoutes = ['/login', '/register', '/create-post'];
  const showSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Loading overlay */}
      

      {/* Main content with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar (responsive) */}
        {showSidebar && (
          <>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <div className={`
              fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg 
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0 lg:shadow-none
            `}>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Page content */}
        <main className={`flex-1 ${showSidebar ? 'lg:ml-64' : ''}`}>
          {children}
        </main>
      </div>
 
    </div>
  );
};

export default Layout;