import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { CheckSquare, Calendar, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { ObligationStatusBadge } from '../common/Badge';

export const ObligationMilestoneChart: React.FC = () => {
  const { obligations, setCurrentView } = useContracts();

  // Category counts
  const categoriesMap: Record<string, number> = {};
  obligations.forEach(o => {
    categoriesMap[o.category] = (categoriesMap[o.category] || 0) + 1;
  });

  const categoryEntries = Object.entries(categoriesMap);
  const maxCount = Math.max(...Object.values(categoriesMap), 1);

  // Upcoming sorted obligations
  const upcomingObligations = [...obligations]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Category Distribution Breakdown */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              Obligation Distribution by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Extracted action requirements across active enterprise commitments
            </p>
          </div>
          <span className="font-mono text-xs text-blue-700 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded px-2 py-0.5">
            {obligations.length} Total
          </span>
        </div>

        <div className="mt-4 space-y-3.5">
          {categoryEntries.map(([cat, count]) => {
            const percentage = Math.round((count / obligations.length) * 100);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{cat}</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Upcoming Milestones Timeline */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                Upcoming Critical Deadlines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Next scheduled compliance filings, audits, and true-ups
              </p>
            </div>
            <button
              onClick={() => setCurrentView('obligations')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>View Tracker</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60 space-y-2">
            {upcomingObligations.map(ob => {
              const isOverdue = ob.status === 'Overdue';

              return (
                <div key={ob.id} className="pt-2 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-2">
                      <span>{ob.title}</span>
                      {isOverdue && (
                        <span className="text-[10px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-1.5 py-0.2 rounded font-mono font-medium">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {ob.contractTitle} · <span className="text-slate-700 dark:text-slate-300">{ob.assignedTo.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      <span>{ob.dueDate}</span>
                    </div>
                    <div className="mt-1">
                      <ObligationStatusBadge status={ob.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Automated calendar sync enabled</span>
          </div>
          <button
            onClick={() => setCurrentView('obligations')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Manage all obligations →
          </button>
        </div>
      </div>
    </div>
  );
};
