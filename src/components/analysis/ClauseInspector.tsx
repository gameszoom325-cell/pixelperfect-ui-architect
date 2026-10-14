import React, { useState } from 'react';
import { Contract, ExtractedClause, ClauseCategory } from '../../types/contract';
import { RiskBadge } from '../common/Badge';
import { useContracts } from '../../context/ContractContext';
import { 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Edit3, 
  Zap, 
  FileText,
  Clock,
  Shield,
  Link
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface ClauseInspectorProps {
  contract: Contract;
  activeClauseId: string | null;
  onSelectClause: (clauseId: string) => void;
  onOpenActionDrawer: (clause: ExtractedClause) => void;
}

export const ClauseInspector: React.FC<ClauseInspectorProps> = ({
  contract,
  activeClauseId,
  onSelectClause,
  onOpenActionDrawer
}) => {
  const { updateClauseSummary } = useContracts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingClause, setEditingClause] = useState<ExtractedClause | null>(null);
  const [editedSummary, setEditedSummary] = useState('');

  const activeClause = contract.clauses.find(c => c.id === activeClauseId) || contract.clauses[0];

  const filteredClauses = contract.clauses.filter(c => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const categories: ClauseCategory[] = [
    'Financial & Payment',
    'Service Level Agreement (SLA)',
    'Data Privacy & Compliance',
    'Termination & Renewal',
    'Liability & Indemnification'
  ];

  const handleEditClick = (e: React.MouseEvent, clause: ExtractedClause) => {
    e.stopPropagation();
    setEditingClause(clause);
    setEditedSummary(clause.aiSummary);
  };

  const handleSaveOverride = () => {
    if (editingClause) {
      updateClauseSummary(contract.id, editingClause.id, editedSummary);
      setEditingClause(null);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-xl dark:shadow-2xl">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>AI Clause Intelligence & Action Extraction</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {contract.clauses.length} vectorized legal clauses with automatic downstream pipeline hooks
          </p>
        </div>

        <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded px-2 py-0.5 font-semibold">
          {contract.ingestionConfidence}% Confidence
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({contract.clauses.length})
        </button>

        {categories.map(cat => {
          const count = contract.clauses.filter(c => c.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Clause Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredClauses.map(clause => {
          const isSelected = clause.id === activeClause?.id;
          const isCritical = clause.riskTier === 'Critical' || clause.riskTier === 'High';

          return (
            <div
              key={clause.id}
              onClick={() => onSelectClause(clause.id)}
              className={`rounded-xl border p-4.5 transition-all cursor-pointer ${
                isSelected
                  ? isCritical
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/70 dark:bg-rose-950/20 shadow-md ring-1 ring-rose-500'
                    : 'border-blue-400 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/20 shadow-md ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900/80'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {clause.clauseNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Page {clause.pageNumber}
                    </span>
                    {!clause.isStandard && (
                      <span className="text-[10px] font-mono font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 rounded px-1.5 py-0.2">
                        NON-STANDARD CLAUSE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5">
                    {clause.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <RiskBadge tier={clause.riskTier} />
                </div>
              </div>

              {/* AI Natural Language Summary */}
              <div className="mt-2 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm dark:shadow-none">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Executive Synthesis
                </div>
                {clause.aiSummary}
              </div>

              {/* Risk Reasoning Alert if applicable */}
              {clause.riskReasoning && (
                <div className="mt-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-2.5 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <p className="leading-snug text-[11px]">{clause.riskReasoning}</p>
                </div>
              )}

              {/* Raw snippet quote */}
              <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 font-serif italic border-l-2 border-slate-300 dark:border-slate-700 pl-2.5 py-0.5 line-clamp-2">
                &ldquo;{clause.rawText}&rdquo;
              </div>

              {/* Action Pipeline Hooks & Buttons */}
              <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-mono border border-slate-200 dark:border-slate-700">
                    {clause.actionItems.length} Actions Hooked
                  </span>
                  <button
                    onClick={e => handleEditClick(e, clause)}
                    aria-label={`Edit AI summary for ${clause.clauseNumber}`}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit summary</span>
                  </button>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onOpenActionDrawer(clause);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Zap className="h-3.5 w-3.5 text-yellow-300" />
                  <span>Actionize Clause</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Clause Modal */}
      <Modal
        isOpen={Boolean(editingClause)}
        onClose={() => setEditingClause(null)}
        title={`Override AI Summary for ${editingClause?.clauseNumber}`}
        subtitle={editingClause?.title}
        maxWidth="lg"
        footer={
          <>
            <button
              onClick={() => setEditingClause(null)}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOverride}
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Save Custom Override
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Legal Text Citation
            </label>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-serif italic text-xs leading-relaxed">
              &ldquo;{editingClause?.rawText}&rdquo;
            </div>
          </div>

          <div>
            <label htmlFor="ai-summary-input" className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              AI Executive Summary Override
            </label>
            <textarea
              id="ai-summary-input"
              rows={4}
              value={editedSummary}
              onChange={e => setEditedSummary(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
