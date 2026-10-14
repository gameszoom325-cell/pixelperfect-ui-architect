import React, { useState } from 'react';
import { ContractProvider, useContracts } from './context/ContractContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/layout/ToastContainer';
import { DashboardView } from './views/DashboardView';
import { UploadView } from './views/UploadView';
import { AnalysisView } from './views/AnalysisView';
import { ObligationsView } from './views/ObligationsView';
import { ApprovalsView } from './views/ApprovalsView';

const MainLayout: React.FC = () => {
  const { currentView } = useContracts();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Desktop & Collapsible Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close mobile navigation"
          />
          <div className="relative z-50 flex h-full shadow-2xl">
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Workspace Column */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader onToggleMobileNav={() => setMobileNavOpen(prev => !prev)} />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950/95 transition-colors">
          <div className="mx-auto max-w-7xl">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'upload' && <UploadView />}
            {currentView === 'analysis' && <AnalysisView />}
            {currentView === 'obligations' && <ObligationsView />}
            {currentView === 'approvals' && <ApprovalsView />}
          </div>
        </main>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Toast Notification Stack */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ContractProvider>
      <MainLayout />
    </ContractProvider>
  );
}
