import React, { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { ToastContainer } from '../common/ToastContainer';
import { FloatingChatbot } from '../common/FloatingChatbot';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <div className="flex flex-1 min-h-0">
        {/* Collapsible Sidebar on Desktop */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          {/* Main Viewport */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNavigation />

      {/* Global Toast System */}
      <ToastContainer />

      {/* Floating 3D Chatbot */}
      <FloatingChatbot />
    </div>
  );
};
