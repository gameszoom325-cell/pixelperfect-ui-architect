import React, { useState } from 'react';
import { useContracts } from '../context/ContractContext';
import { ExtractedClause } from '../types/contract';
import { DocumentViewer } from '../components/analysis/DocumentViewer';
import { ClauseInspector } from '../components/analysis/ClauseInspector';
import { ActionPipelineDrawer } from '../components/analysis/ActionPipelineDrawer';
import { RiskAnalysisMatrix } from '../components/analysis/RiskAnalysisMatrix';
import { RiskBadge, ContractStatusBadge } from '../components/common/Badge';

export const AnalysisView: React.FC = () => {
  const { contracts, activeContractId, setActiveContractId, activeContract } = useContracts();
  
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(
    activeContract.clauses[0]?.id || null
  );
  const [actionDrawerClause, setActionDrawerClause] = useState<ExtractedClause | null>(null);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(false);

  const handleOpenActionDrawer = (clause: ExtractedClause) => {
    setActionDrawerClause(clause);
    setIsActionDrawerOpen(true);
  };

  const formattedVal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: activeContract.currency,
    maximumFractionDigits: 0
  }).format(activeContract.totalValue);

  return (
    <div className="space-y-6">
      {/* Top Contract Context Selector & Summary Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <ContractStatusBadge status={activeContract.status} />
              <RiskBadge tier={activeContract.riskTier} score={activeContract.riskScore} />
              <span className="font-mono text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded px-2 py-0.5">
                {activeContract.contractNumber}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {activeContract.title}
            </h2>

            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2 font-mono">
              <span>Counterparty: {activeContract.counterparty}</span>
              <span aria-hidden="true">·</span>
              <span>Value: {formattedVal}</span>
              <span aria-hidden="true">·</span>
              <span>Term: {activeContract.effectiveDate} to {activeContract.expirationDate}</span>
              <span aria-hidden="true">·</span>
              <span>Owner: {activeContract.ownerName}</span>
            </div>
          </div>

          {/* Quick Contract Switcher dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="switch-contract" className="text-xs text-slate-600 dark:text-slate-400 font-medium">Switch Agreement:</label>
            <select
              id="switch-contract"
              value={activeContractId}
              onChange={e => {
                setActiveContractId(e.target.value);
                const newC = contracts.find(c => c.id === e.target.value);
                if (newC && newC.clauses.length > 0) {
                  setSelectedClauseId(newC.clauses[0].id);
                }
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer font-medium"
            >
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.contractNumber} — {c.counterparty} ({c.riskTier} Risk)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Split Screen Deep Inspection Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left 6 cols: Document Viewer */}
        <div className="lg:col-span-6 h-full">
          <DocumentViewer
            contract={activeContract}
            activeClauseId={selectedClauseId}
            onSelectClause={setSelectedClauseId}
          />
        </div>

        {/* Right 6 cols: Clause Inspector & Actionizer */}
        <div className="lg:col-span-6 h-full">
          <ClauseInspector
            contract={activeContract}
            activeClauseId={selectedClauseId}
            onSelectClause={setSelectedClauseId}
            onOpenActionDrawer={handleOpenActionDrawer}
          />
        </div>
      </div>

      {/* Bottom Section: Risk Analysis Matrix & Playbook Compliance */}
      <RiskAnalysisMatrix contract={activeContract} />

      {/* Action Pipeline Drawer */}
      <ActionPipelineDrawer
        clause={actionDrawerClause}
        isOpen={isActionDrawerOpen}
        onClose={() => setIsActionDrawerOpen(false)}
      />
    </div>
  );
};
