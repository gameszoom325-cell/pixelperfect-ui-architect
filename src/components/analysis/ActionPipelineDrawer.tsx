import React, { useState } from 'react';
import { ExtractedClause, ActionSystem, ActionItem } from '../../types/contract';
import { useContracts } from '../../context/ContractContext';
import { 
  Zap, 
  X, 
  CheckCircle2, 
  Send
} from 'lucide-react';

interface ActionPipelineDrawerProps {
  clause: ExtractedClause | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActionPipelineDrawer: React.FC<ActionPipelineDrawerProps> = ({
  clause,
  isOpen,
  onClose
}) => {
  const { addToast, addAuditLog, activeContract } = useContracts();

  const [selectedSystem, setSelectedSystem] = useState<ActionSystem>('Jira');
  const [taskTitle, setTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('Engineering Team Lead');
  const [dueDate, setDueDate] = useState('2026-03-31');
  const [isExecuting, setIsExecuting] = useState(false);

  React.useEffect(() => {
    if (clause) {
      setTaskTitle(`Enforce ${clause.clauseNumber}: ${clause.title}`);
    }
  }, [clause]);

  if (!isOpen || !clause) return null;

  const systems: { id: ActionSystem; name: string; description: string; icon: string }[] = [
    { id: 'Jira', name: 'Jira Software', description: 'Create sprint tracking ticket with compliance acceptance criteria', icon: '🔷' },
    { id: 'SAP / ERP', name: 'SAP ERP Financials', description: 'Schedule milestone true-up payment and audit hold covenants', icon: '🏛️' },
    { id: 'Slack', name: 'Slack Webhook Alert', description: 'Dispatch automated SLA breach alert channel notification', icon: '💬' },
    { id: 'Google Calendar', name: 'Calendar Notice Gate', description: 'Set executive reminder 60 days before auto-renewal deadline', icon: '📅' },
    { id: 'ServiceNow', name: 'ServiceNow GRC', description: 'Trigger vendor security audit intake assessment workflow', icon: '🛡️' }
  ];

  const handleExecute = () => {
    setIsExecuting(true);

    setTimeout(() => {
      setIsExecuting(false);

      const newAction: ActionItem = {
        id: 'act-' + Date.now(),
        title: taskTitle,
        system: selectedSystem,
        status: 'Executed',
        assignedTo,
        dueDate,
        payloadSummary: `Automated webhook dispatched to ${selectedSystem} API gateway for ${clause.clauseNumber}`
      };

      clause.actionItems.push(newAction);

      addAuditLog(
        `Executed Action Pipeline (${selectedSystem})`,
        `${clause.clauseNumber} in ${activeContract.contractNumber}`,
        `Created automated task: "${taskTitle}" assigned to ${assignedTo}. Due ${dueDate}`,
        'System'
      );

      addToast({
        type: 'success',
        title: `Action Pipeline Executed in ${selectedSystem}`,
        message: `Dispatched automated workflow payload for "${taskTitle}".`
      });

      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                Automated Action Pipeline Generator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Transform extracted clause into live operational workflows
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close action drawer"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-800 dark:text-slate-200">
          {/* Source Clause Reference */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 dark:text-blue-400 font-bold">
              SOURCE CLAUSE CITATION
            </span>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
              {clause.clauseNumber}: {clause.title}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-serif italic">
              &ldquo;{clause.rawText}&rdquo;
            </p>
          </div>

          {/* Target System Picker */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2 uppercase text-[10px] tracking-wider">
              1. Select Destination Integration Engine
            </label>
            <div className="space-y-2">
              {systems.map(sys => {
                const isSelected = selectedSystem === sys.id;
                return (
                  <div
                    key={sys.id}
                    onClick={() => setSelectedSystem(sys.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') setSelectedSystem(sys.id); }}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-lg mt-0.5">{sys.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white text-xs">{sys.name}</span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {sys.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Configuration Form */}
          <div className="space-y-3.5 pt-2">
            <label className="block text-slate-700 dark:text-slate-300 font-medium uppercase text-[10px] tracking-wider">
              2. Configure Payload Parameters
            </label>

            <div>
              <label htmlFor="pipeline-title" className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Generated Task Title</label>
              <input
                id="pipeline-title"
                type="text"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pipeline-assigned" className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Assigned Owner / Role</label>
                <input
                  id="pipeline-assigned"
                  type="text"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="pipeline-date" className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Execution / Due Date</label>
                <input
                  id="pipeline-date"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Webhook JSON Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 font-mono text-[11px]">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Live Payload Preview ({selectedSystem} REST API v2)
            </span>
            <pre className="text-blue-700 dark:text-blue-300 overflow-x-auto">
{JSON.stringify({
  event: "contract2action.pipeline.trigger",
  contractNumber: activeContract.contractNumber,
  clauseId: clause.id,
  targetSystem: selectedSystem,
  actionTitle: taskTitle,
  assignee: assignedTo,
  dueDate: dueDate,
  riskTier: clause.riskTier,
  complianceHook: "VERIFIED_AUDIT_TRAIL"
}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isExecuting ? 'Dispatching Webhook...' : `Deploy to ${selectedSystem}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
