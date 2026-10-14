import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { Obligation } from '../../types/contract';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import { ObligationStatusBadge } from '../common/Badge';

export const ObligationsTimeline: React.FC = () => {
  const { obligations, updateObligationStatus, setActiveContractId, setCurrentView } = useContracts();

  // Group obligations by month / year
  const timelineGroups: Record<string, Obligation[]> = {};
  
  const sorted = [...obligations].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  sorted.forEach(ob => {
    const date = new Date(ob.dueDate);
    const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!timelineGroups[monthYear]) {
      timelineGroups[monthYear] = [];
    }
    timelineGroups[monthYear].push(ob);
  });

  const handleInspectContract = (contractId: string) => {
    setActiveContractId(contractId);
    setCurrentView('analysis');
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Milestone Calendar & Obligation Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chronological horizon mapping compliance audits, true-ups, and SLA claim deadlines
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {Object.entries(timelineGroups).map(([monthYear, obs]) => (
          <div key={monthYear} className="relative pl-9">
            {/* Timeline node */}
            <div className="absolute left-2 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-950 bg-blue-600 dark:bg-blue-500 ring-4 ring-slate-100 dark:ring-slate-900" />

            <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
              {monthYear} ({obs.length} Milestones)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {obs.map(ob => {
                const isOverdue = ob.status === 'Overdue';

                return (
                  <div
                    key={ob.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isOverdue 
                        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                      <span className="font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                        {ob.dueDate}
                      </span>
                      <ObligationStatusBadge status={ob.status} />
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      {ob.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                      {ob.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div 
                        onClick={() => handleInspectContract(ob.contractId)}
                        className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1 font-mono truncate max-w-[180px]"
                      >
                        <span className="truncate">{ob.contractTitle}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </div>

                      {ob.status !== 'Fulfilled' && (
                        <button
                          onClick={() => updateObligationStatus(ob.id, 'Fulfilled')}
                          className="rounded bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-medium"
                        >
                          Mark Fulfilled
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
