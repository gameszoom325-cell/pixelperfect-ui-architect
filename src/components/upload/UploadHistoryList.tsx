import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { FileCheck, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

export const UploadHistoryList: React.FC = () => {
  const { ingestionTasks, contracts, setActiveContractId, setCurrentView } = useContracts();

  const completedTasks = ingestionTasks.filter(t => t.currentStage === 'Completed');

  const handleOpenLatest = (taskFileName: string) => {
    const matching = contracts.find(c => 
      c.title.toLowerCase().includes(taskFileName.replace(/\.[^/.]+$/, '').toLowerCase()) ||
      taskFileName.toLowerCase().includes(c.counterparty.toLowerCase().split(' ')[0])
    );
    if (matching) {
      setActiveContractId(matching.id);
    }
    setCurrentView('analysis');
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ingestion History & OCR Confidence Ledger</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-grade record of vectorized documents, extracted clauses, and OCR quality metrics
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {completedTasks.length} Completed Ingestions
        </span>
      </div>

      <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
        {completedTasks.map(task => (
          <div
            key={task.id}
            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-850/50 p-2 rounded-xl transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{task.fileName}</h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{task.fileSize}</span>
                  <span aria-hidden="true">·</span>
                  <span>{task.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{task.department}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.uploadedAt}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 sm:self-center">
              <div className="text-right">
                <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {task.confidenceScore.toFixed(1)}% Confidence
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {task.extractedClausesCount} clauses parsed
                </div>
              </div>

              <button
                onClick={() => handleOpenLatest(task.fileName)}
                className="flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>Inspect Clauses</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
