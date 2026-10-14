import React from 'react';
import { ApprovalWorkflow } from '../../types/contract';
import { ShieldCheck } from 'lucide-react';

interface ApprovalWorkflowVisualizerProps {
  workflow: ApprovalWorkflow;
  onOpenActionModal: () => void;
}

export const ApprovalWorkflowVisualizer: React.FC<ApprovalWorkflowVisualizerProps> = ({
  workflow,
  onOpenActionModal
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Sequential Governance Chain & Signature Authorization
            </h3>
            <span className="font-mono text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded px-2 py-0.5">
              {workflow.steps.length} Approval Gates
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-grade multi-role gatekeeping for {workflow.contractTitle} ({workflow.dealValue})
          </p>
        </div>

        <button
          onClick={onOpenActionModal}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Execute Approval / Redline</span>
        </button>
      </div>

      {/* Visual Chain Steps */}
      <div className="mt-6 space-y-4">
        {workflow.steps.map((step, idx) => {
          const isApproved = step.status === 'Approved';
          const isRejected = step.status === 'Rejected';
          const isPending = step.status === 'Pending';

          return (
            <div
              key={idx}
              className={`rounded-xl border p-4.5 transition-all ${
                isApproved
                  ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : isRejected
                  ? 'border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20'
                  : isPending
                  ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 ring-1 ring-amber-500'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/60 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs shrink-0 ${
                      isApproved
                        ? 'bg-emerald-600 text-white'
                        : isRejected
                        ? 'bg-rose-600 text-white'
                        : isPending
                        ? 'bg-amber-600 text-white animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isApproved ? '✓' : isRejected ? '✕' : step.stepNumber}
                  </div>

                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <span>{step.role}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-medium ${
                        isApproved ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        isRejected ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                        isPending ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {step.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {step.assigneeName} ({step.assigneeEmail})
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  {step.timestamp ? (
                    <div>
                      <span>Signed: {new Date(step.timestamp).toLocaleDateString()}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <span>Awaiting authorization</span>
                  )}
                </div>
              </div>

              {/* Reviewer Comments & Signature Stamp */}
              {step.comments && (
                <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-serif italic border-l-2 border-slate-300 dark:border-slate-700 pl-3 py-1">
                  &ldquo;{step.comments}&rdquo;
                </div>
              )}

              {step.signatureStamp && (
                <div className="mt-2.5 flex items-center gap-2 font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>PKI Authorization Stamp: {step.signatureStamp}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
