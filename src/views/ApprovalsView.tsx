import React, { useState } from 'react';
import { useContracts } from '../context/ContractContext';
import { ApprovalWorkflow } from '../types/contract';
import { ObligationApprovalQueue } from '../components/approvals/ObligationApprovalQueue';
import { ApprovalsInbox } from '../components/approvals/ApprovalsInbox';
import { ApprovalWorkflowVisualizer } from '../components/approvals/ApprovalWorkflowVisualizer';
import { ApprovalActionModal } from '../components/approvals/ApprovalActionModal';
import { AuditGovernanceLog } from '../components/approvals/AuditGovernanceLog';
import { ShieldCheck, CheckSquare, FileText, History } from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { approvalWorkflows, currentUserRole, metrics } = useContracts();
  const [activeTab, setActiveTab] = useState<'obligations_queue' | 'contract_signoff' | 'audit_trail'>('obligations_queue');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow>(
    approvalWorkflows.find(w => w.overallStatus === 'Pending Review' || w.overallStatus === 'Changes Requested') || approvalWorkflows[0]
  );
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner & Tab Switcher */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1 font-mono">
                <ShieldCheck className="h-4 w-4" />
                ENTERPRISE GOVERNANCE & APPROVALS HUB
              </span>
              <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded px-2 py-0.5">
                Active Role: {currentUserRole}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Human Review & Governance Center
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review AI-extracted obligations, authorize business tasks, or inspect multi-tier executive sign-offs.
            </p>
          </div>

          {/* Sub-view Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setActiveTab('obligations_queue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'obligations_queue'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Obligation Queue ({metrics.pendingObligationsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('contract_signoff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'contract_signoff'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Contract Sign-off ({metrics.pendingApprovalsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit_trail')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'audit_trail'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Full Audit Trail</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Tab: Obligation Human Approval Queue */}
      {activeTab === 'obligations_queue' && (
        <ObligationApprovalQueue />
      )}

      {/* Secondary Tab: Multi-tier Contract Sign-off */}
      {activeTab === 'contract_signoff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <ApprovalsInbox
                onSelectWorkflow={wf => setSelectedWorkflow(wf)}
              />
            </div>

            <div className="lg:col-span-7">
              {selectedWorkflow ? (
                <ApprovalWorkflowVisualizer
                  workflow={selectedWorkflow}
                  onOpenActionModal={() => setIsActionModalOpen(true)}
                />
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                  Select an agreement from the inbox to inspect its governance chain
                </div>
              )}
            </div>
          </div>

          <ApprovalActionModal
            workflow={selectedWorkflow}
            isOpen={isActionModalOpen}
            onClose={() => setIsActionModalOpen(false)}
          />
        </div>
      )}

      {/* Tertiary Tab: Audit Governance Log */}
      {activeTab === 'audit_trail' && (
        <AuditGovernanceLog />
      )}
    </div>
  );
};
