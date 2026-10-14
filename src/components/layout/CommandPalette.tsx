import React, { useState, useEffect } from 'react';
import { useContracts, AppView } from '../../context/ContractContext';
import { 
  Search, 
  FileText, 
  CheckSquare, 
  ShieldCheck, 
  UploadCloud, 
  ArrowRight, 
  X, 
  Zap 
} from 'lucide-react';
import { RiskBadge, ObligationStatusBadge } from '../common/Badge';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    contracts, 
    obligations, 
    setCurrentView, 
    setActiveContractId 
  } = useContracts();
  
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredContracts = contracts.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.contractNumber.toLowerCase().includes(query.toLowerCase()) ||
    c.counterparty.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredObligations = obligations.filter(o => 
    o.title.toLowerCase().includes(query.toLowerCase()) ||
    o.contractTitle.toLowerCase().includes(query.toLowerCase()) ||
    o.assignedTo.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const quickNavigations = [
    { label: 'Executive Dashboard', view: 'dashboard' as AppView, icon: <Zap className="h-4 w-4 text-blue-500" /> },
    { label: 'Contract Ingestion & AI Extraction', view: 'upload' as AppView, icon: <UploadCloud className="h-4 w-4 text-emerald-500" /> },
    { label: 'Contract Deep Inspector & Analysis', view: 'analysis' as AppView, icon: <FileText className="h-4 w-4 text-indigo-500" /> },
    { label: 'Execution Task Board', view: 'obligations' as AppView, icon: <CheckSquare className="h-4 w-4 text-amber-500" /> },
    { label: 'Human Approval Queue', view: 'approvals' as AppView, icon: <ShieldCheck className="h-4 w-4 text-purple-500" /> }
  ];

  const handleSelectContract = (contractId: string) => {
    setActiveContractId(contractId);
    setCurrentView('analysis');
    setIsCommandPaletteOpen(false);
  };

  const handleSelectObligation = (contractId: string) => {
    setActiveContractId(contractId);
    setCurrentView('obligations');
    setIsCommandPaletteOpen(false);
  };

  const handleSelectNav = (view: AppView) => {
    setCurrentView(view);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Global search command palette"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/20 dark:shadow-black/80 z-10 flex flex-col max-h-[75vh]">
        {/* Search Input Box */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 bg-slate-50 dark:bg-slate-900/90">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search prompt"
            placeholder="Search contracts, extracted clauses, obligations, counterparties, or type 'jump'..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            ESC
          </kbd>
          <button 
            onClick={() => setIsCommandPaletteOpen(false)}
            aria-label="Close command palette"
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4">
          {/* Contracts Section */}
          {filteredContracts.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Contracts ({filteredContracts.length})
              </div>
              <div className="space-y-1">
                {filteredContracts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectContract(c.id)}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {c.title}
                        </span>
                        <span className="ml-2 text-slate-500 dark:text-slate-400 font-mono">
                          {c.contractNumber} · {c.counterparty}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RiskBadge tier={c.riskTier} score={c.riskScore} />
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Obligations Section */}
          {filteredObligations.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Obligations & Milestones ({filteredObligations.length})
              </div>
              <div className="space-y-1">
                {filteredObligations.map(o => (
                  <div
                    key={o.id}
                    onClick={() => handleSelectObligation(o.contractId)}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {o.title}
                        </span>
                        <span className="ml-2 text-slate-500 dark:text-slate-400">
                          Due {o.dueDate} · {o.assignedTo.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ObligationStatusBadge status={o.status} />
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigations */}
          <div>
            <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Platform Views
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickNavigations.map(nav => (
                <div
                  key={nav.view}
                  onClick={() => handleSelectNav(nav.view)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                >
                  {nav.icon}
                  <span className="font-medium">{nav.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>Navigate: <kbd className="font-mono text-slate-700 dark:text-slate-300">↑↓</kbd></span>
            <span>Select: <kbd className="font-mono text-slate-700 dark:text-slate-300">ENTER</kbd></span>
          </div>
          <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">Contract2Action Intelligence Engine</span>
        </div>
      </div>
    </div>
  );
};
