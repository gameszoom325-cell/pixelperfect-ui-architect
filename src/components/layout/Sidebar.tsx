import React, { useState } from 'react';
import { useContracts, AppView, UserRole } from '../../context/ContractContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileSearch, 
  CheckSquare, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  Zap, 
  Sparkles 
} from 'lucide-react';

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { 
    currentView, 
    setCurrentView, 
    metrics, 
    currentUserRole, 
    setCurrentUserRole,
    ingestionTasks,
    activeContract
  } = useContracts();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const pendingIngestionCount = ingestionTasks.filter(t => t.currentStage !== 'Completed').length;

  const handleNav = (view: AppView) => {
    setCurrentView(view);
    if (onNavigate) {
      onNavigate();
    }
  };

  const navItems = [
    {
      id: 'dashboard' as AppView,
      label: 'Overview Dashboard',
      shortLabel: 'Overview',
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
      badge: null
    },
    {
      id: 'upload' as AppView,
      label: 'Contract Ingestion & OCR',
      shortLabel: 'Ingestion',
      icon: <UploadCloud className="h-5 w-5 shrink-0" />,
      badge: pendingIngestionCount > 0 ? `${pendingIngestionCount} Active` : null,
      badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/60'
    },
    {
      id: 'analysis' as AppView,
      label: 'Analysis & Clause Extraction',
      shortLabel: 'Inspector',
      icon: <FileSearch className="h-5 w-5 shrink-0" />,
      badge: activeContract ? activeContract.contractNumber.slice(-4) : null,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    },
    {
      id: 'obligations' as AppView,
      label: 'Task Board & Execution',
      shortLabel: 'Task Board',
      icon: <CheckSquare className="h-5 w-5 shrink-0" />,
      badge: metrics.overdueObligationsCount > 0 ? `${metrics.overdueObligationsCount} Overdue` : `${metrics.activeTasksCount} Active`,
      badgeColor: metrics.overdueObligationsCount > 0 ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/70' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/70'
    },
    {
      id: 'approvals' as AppView,
      label: 'Human Approval Queue',
      shortLabel: 'Approvals',
      icon: <ShieldCheck className="h-5 w-5 shrink-0" />,
      badge: metrics.pendingObligationsCount > 0 ? `${metrics.pendingObligationsCount} Pending` : '0',
      badgeColor: metrics.pendingObligationsCount > 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/70' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }
  ];

  const roles: UserRole[] = [
    'Legal Counsel',
    'Head of Procurement',
    'VP Finance / CFO',
    'Contract Operations Lead'
  ];

  return (
    <aside 
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 transition-all duration-300 ease-in-out z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Brand & Wordmark Zone */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-4 py-4.5 h-16">
        <div 
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Contract2Action AI Home"
          onKeyDown={e => { if (e.key === 'Enter') handleNav('dashboard'); }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 text-white shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-1.5">
                Contract<span className="text-blue-600 dark:text-blue-400">2</span>Action
                <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50 rounded px-1 py-0.2">
                  AI
                </span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-tight mt-0.5 truncate">
                Enterprise Contract Operations
              </span>
            </div>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Primary Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {!isCollapsed ? 'Workflow Modules' : '•'}
        </div>

        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all group focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${
                    isActive ? 'bg-blue-700 text-white border-blue-500' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Ingestion Quick Action Banner */}
        {!isCollapsed && (
          <div className="pt-4">
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-gradient-to-b from-blue-50 dark:from-blue-950/40 to-slate-50 dark:to-slate-900/60 p-3.5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>Autonomous Actionizer</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Convert uploaded agreements into synchronized tasks across Jira, SAP, and Slack.
              </p>
              <button
                onClick={() => handleNav('upload')}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Ingest New Contract</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role / Persona Switcher */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 bg-slate-50 dark:bg-slate-950/90">
        {!isCollapsed ? (
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label 
                htmlFor="persona-select" 
                className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 cursor-pointer"
              >
                <Users className="h-3 w-3" />
                Active Persona
              </label>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">RBAC Mode</span>
            </div>
            <select
              id="persona-select"
              aria-label="Active user role persona"
              value={currentUserRole}
              onChange={e => setCurrentUserRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer font-medium"
            >
              {roles.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex justify-center" title={`Current role: ${currentUserRole}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 shrink-0">
          <span>ER</span>
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              Elena Rostova
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {currentUserRole}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
