import React, { useState, useEffect, useRef } from 'react';
import { useContracts, AppView, ThemeMode } from '../../context/ContractContext';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  ShieldAlert, 
  ChevronRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface TopHeaderProps {
  onToggleMobileNav?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleMobileNav }) => {
  const { 
    currentView, 
    setCurrentView,
    activeContract, 
    setIsCommandPaletteOpen, 
    themeMode, 
    setThemeMode,
    resolvedTheme,
    metrics,
    auditLogs
  } = useContracts();

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications on Escape or Click Outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNotifications) {
        setShowNotifications(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const viewTitles: Record<AppView, { title: string; category: string }> = {
    dashboard: { title: 'Overview Dashboard', category: 'Executive Suite' },
    upload: { title: 'Contract Ingestion & OCR', category: 'Document Ingestion' },
    analysis: { title: activeContract ? activeContract.title : 'Clause Extraction', category: 'Deep Inspection' },
    obligations: { title: 'Execution Task Board', category: 'Task Execution' },
    approvals: { title: 'Human Approval Queue', category: 'Governance & Risk' }
  };

  const currentMeta = viewTitles[currentView];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200">
      {/* Left: Mobile Toggle + Breadcrumb Trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileNav}
          aria-label="Open mobile navigation menu"
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Contract Intelligence
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 hidden sm:inline" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {currentMeta.category}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-[320px]">
            {currentMeta.title}
          </span>
        </nav>
      </div>

      {/* Right Controls: Search button (Cmd+K), Notifications, Approvals Pill, 3-way Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Input Trigger Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          aria-label="Open search command palette"
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition-colors shadow-sm group focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Search className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">Quick search or actions...</span>
          <span className="md:hidden">Search</span>
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Pending Approvals Quick CTA */}
        {metrics.pendingObligationsCount > 0 && (
          <button
            onClick={() => setCurrentView('approvals')}
            aria-label="Review pending approvals"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{metrics.pendingObligationsCount} In Queue</span>
          </button>
        )}

        {/* Notifications Popover Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Open notifications and audit feed"
            aria-expanded={showNotifications}
            className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Notifications & Audit Feed"
          >
            <Bell className="h-4 w-4" />
            {auditLogs.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-950" />
            )}
          </button>

          {showNotifications && (
            <div 
              role="dialog"
              aria-label="Live audit notifications"
              className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/20 dark:shadow-black/80 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Live Audit & AI Governance Trail
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notification panel"
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                {auditLogs.slice(0, 6).map(log => (
                  <div key={log.id} className="p-2.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{log.action}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium mt-0.5 truncate">
                      {log.target}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-950 text-center">
                <button
                  onClick={() => {
                    setCurrentView('approvals');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View full governance audit log →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark / System) */}
        <div 
          className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-0.5 text-xs"
          role="radiogroup"
          aria-label="Theme selection"
        >
          <button
            onClick={() => setThemeMode('light')}
            role="radio"
            aria-checked={themeMode === 'light'}
            title="Light Theme"
            aria-label="Switch to light theme"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              themeMode === 'light'
                ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setThemeMode('dark')}
            role="radio"
            aria-checked={themeMode === 'dark'}
            title="Dark Theme"
            aria-label="Switch to dark theme"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              themeMode === 'dark'
                ? 'bg-white dark:bg-slate-800 text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setThemeMode('system')}
            role="radio"
            aria-checked={themeMode === 'system'}
            title="System Preference"
            aria-label="Switch to system theme preference"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              themeMode === 'system'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
