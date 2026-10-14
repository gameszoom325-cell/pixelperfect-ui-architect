import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { 
  FileCheck2, 
  Scan, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export const IngestionPipelineVisualizer: React.FC = () => {
  const { ingestionTasks } = useContracts();

  const activeTasks = ingestionTasks.filter(t => t.currentStage !== 'Completed');

  if (activeTasks.length === 0) return null;

  const stages = [
    { name: 'OCR Scanning', icon: <Scan className="h-3.5 w-3.5" /> },
    { name: 'Semantic Chunking', icon: <Cpu className="h-3.5 w-3.5" /> },
    { name: 'Clause Extraction', icon: <Layers className="h-3.5 w-3.5" /> },
    { name: 'Action Pipeline Generation', icon: <FileCheck2 className="h-3.5 w-3.5" /> }
  ];

  return (
    <div className="rounded-2xl border border-blue-300 dark:border-blue-900/60 bg-gradient-to-b from-blue-50 via-white to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 p-5 shadow-sm dark:shadow-xl transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
            Active Processing Pipeline ({activeTasks.length} In Progress)
          </h3>
        </div>
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
          Neural Vector Indexing Active
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {activeTasks.map(task => {
          return (
            <div key={task.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="truncate">
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">{task.fileName}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono ml-2">({task.fileSize} · {task.department})</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{task.progress}%</span>
                  <span className="rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-mono font-medium">
                    {task.currentStage}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>

              {/* Stages Indicator */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {stages.map((stage, idx) => {
                  const stageIndex = stages.findIndex(s => s.name === task.currentStage);
                  const isDone = stageIndex > idx || task.progress === 100;
                  const isCurrent = task.currentStage === stage.name;

                  return (
                    <div
                      key={stage.name}
                      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 border transition-colors ${
                        isDone
                          ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                          : isCurrent
                          ? 'border-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold animate-pulse'
                          : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : stage.icon}
                      <span className="truncate">{stage.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
