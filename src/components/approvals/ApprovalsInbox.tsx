import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { ApprovalWorkflow } from '../../types/contract';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  FileText,
  ArrowRight
} from 'lucide-react';

interface ApprovalsInboxProps {
  onSelectWorkflow: (workflow: ApprovalWorkflow) => void;
}

export const ApprovalsInbox: React.FC<ApprovalsInboxProps> = ({ onSelectWorkflow }) => {
  const { approvalWorkflows, setActiveContractId, setCurrentView } = useContracts();
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved'>('all');

  const filteredWorkflows = approvalWorkflows.filter(wf => {
    if (filterTab === 'pending') return wf.overallStatus === 'Pending Review' || wf.overallStatus === 'Changes Requested';
    if (filterTab === 'approved') return wf.overallStatus === 'Approved';
    return true;
  });

  const handleInspectContract = (contractId: string) => {
    setActiveContractId(contractId);
    setCurrentView('analysis');
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
            filterTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Approvals ({approvalWorkflows.length})
        </button>
        <button
          onClick={() => setFilterTab('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
            filterTab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pending Review ({approvalWorkflows.filter(w => w.overallStatus === 'Pending Review' || w.overallStatus === 'Changes Requested').length})
        </button>
        <button
          onClick={() => setFilterTab('approved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
            filterTab === 'approved'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Approved & Executed ({approvalWorkflows.filter(w => w.overallStatus === 'Approved').length})
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filteredWorkflows.map(wf => {
          const currentStep = wf.steps[wf.currentStepIndex];
          const isPending = wf.overallStatus === 'Pending Review' || wf.overallStatus === 'Changes Requested';

          return (
            <div
              key={wf.id}
              className={`rounded-2xl border p-5 backdrop-blur transition-all ${
                isPending
                  ? 'border-amber-300 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/70 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm dark:shadow-xl'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm dark:shadow-none'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      wf.overallStatus === 'Approved'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : wf.overallStatus === 'Changes Requested'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {wf.overallStatus.toUpperCase()}
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {wf.dealValue}
                    </span>

                    {wf.flaggedClausesCount > 0 && (
                      <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                        <AlertTriangle className="h-3 w-3" />
                        {wf.flaggedClausesCount} Non-Standard Flag
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                    {wf.contractTitle}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2 font-mono">
                    <span>Vendor: {wf.counterparty}</span>
                    <span aria-hidden="true">·</span>
                    <span>Requested by: {wf.requestedBy}</span>
                    <span aria-hidden="true">·</span>
                    <span>Dept: {wf.department}</span>
                  </div>

                  {/* Active Step Indicator */}
                  {currentStep && isPending && (
                    <div className="mt-2 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>
                        Currently awaiting approval from: <strong className="text-slate-900 dark:text-white font-semibold">{currentStep.role}</strong> ({currentStep.assigneeName})
                      </span>
                    </div>
                  )}

                  {wf.notes && (
                    <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 font-serif italic bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 max-w-2xl">
                      &ldquo;{wf.notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => handleInspectContract(wf.contractId)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span>Inspect Clauses</span>
                  </button>

                  <button
                    onClick={() => onSelectWorkflow(wf)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Review Governance Chain</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
