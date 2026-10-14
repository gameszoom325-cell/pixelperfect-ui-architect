import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { Obligation, ObligationStatus } from '../../types/contract';
import { 
  Calendar, 
  ExternalLink 
} from 'lucide-react';

export const ObligationsKanban: React.FC = () => {
  const { obligations, updateObligationStatus, setActiveContractId, setCurrentView } = useContracts();

  const columns: { id: ObligationStatus; title: string; color: string }[] = [
    { id: 'Pending', title: 'Pending / Backlog', color: 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50' },
    { id: 'In Progress', title: 'In Execution', color: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20' },
    { id: 'At Risk', title: 'At Risk / Review', color: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20' },
    { id: 'Fulfilled', title: 'Fulfilled & Audited', color: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20' }
  ];

  const handleInspectContract = (contractId: string) => {
    setActiveContractId(contractId);
    setCurrentView('analysis');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map(col => {
        const columnItems = obligations.filter(o => {
          if (col.id === 'At Risk') {
            return o.status === 'At Risk' || o.status === 'Overdue';
          }
          return o.status === col.id;
        });

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-2xl border ${col.color} p-4 backdrop-blur shadow-sm dark:shadow-lg min-h-[500px] transition-colors`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                {col.title}
              </span>
              <span className="font-mono text-xs text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-800/80 rounded px-2 py-0.5 border border-slate-200 dark:border-slate-700">
                {columnItems.length}
              </span>
            </div>

            {/* Column Items */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnItems.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No obligations in this lane
                </div>
              ) : (
                columnItems.map(ob => {
                  const isOverdue = ob.status === 'Overdue';

                  return (
                    <div
                      key={ob.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {ob.category}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded px-1.5 py-0.2">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {ob.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {ob.description}
                      </p>

                      <div 
                        onClick={() => handleInspectContract(ob.contractId)}
                        className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <span className="truncate">{ob.contractTitle}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </div>

                      {/* Footer & Move Controls */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{ob.dueDate}</span>
                        </div>

                        {/* Quick state progression */}
                        <div className="flex items-center gap-1">
                          {ob.status !== 'Fulfilled' && (
                            <button
                              onClick={() => updateObligationStatus(ob.id, 'Fulfilled')}
                              className="rounded bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 text-[10px] font-medium transition-colors"
                              title="Mark Fulfilled"
                            >
                              ✓ Fulfill
                            </button>
                          )}
                          {ob.status === 'Pending' && (
                            <button
                              onClick={() => updateObligationStatus(ob.id, 'In Progress')}
                              className="rounded bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 px-2 py-0.5 text-[10px] font-medium transition-colors"
                            >
                              Start →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
