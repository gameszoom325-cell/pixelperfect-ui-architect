import React, { useState } from 'react';
import { useContracts } from '../context/ContractContext';
import { TaskBoard } from '../components/obligations/TaskBoard';
import { ObligationsTable } from '../components/obligations/ObligationsTable';
import { ObligationsTimeline } from '../components/obligations/ObligationsTimeline';
import { NewObligationModal } from '../components/obligations/NewObligationModal';
import { 
  Kanban, 
  Table, 
  Calendar, 
  Plus, 
  CheckSquare, 
  Layers,
  ArrowRight
} from 'lucide-react';

export const ObligationsView: React.FC = () => {
  const { metrics, businessTasks, setCurrentView } = useContracts();
  const [activeTab, setActiveTab] = useState<'task_board' | 'timeline' | 'all_obligations'>('task_board');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const activeTasks = businessTasks.filter(t => t.status !== 'Done').length;
  const completedTasks = businessTasks.filter(t => t.status === 'Done').length;

  return (
    <div className="space-y-6">
      {/* View Switcher & KPI Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-mono">
                <CheckSquare className="h-4 w-4" />
                EXECUTION & TASK MANAGEMENT
              </span>
              <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded px-2 py-0.5">
                {activeTasks} Active Tasks · {completedTasks} Completed
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Contract Task Board & Execution Hub
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Approved obligations converted into actionable business tasks with real owners, due dates, and audit trail.
            </p>
          </div>

          {/* Quick CTA to Approvals Queue if pending */}
          {metrics.pendingObligationsCount > 0 && (
            <button
              onClick={() => setCurrentView('approvals')}
              className="flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            >
              <span>{metrics.pendingObligationsCount} In Approval Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('task_board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'task_board'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Business Task Board ({businessTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Milestone Timeline</span>
            </button>

            <button
              onClick={() => setActiveTab('all_obligations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all_obligations'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Contract Obligations Ledger</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Manual Obligation</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'task_board' && <TaskBoard />}
      {activeTab === 'timeline' && <ObligationsTimeline />}
      {activeTab === 'all_obligations' && <ObligationsTable onOpenNewModal={() => setIsNewModalOpen(true)} />}

      {/* New Obligation Modal */}
      <NewObligationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </div>
  );
};
