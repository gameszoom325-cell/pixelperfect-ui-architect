import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert
} from 'lucide-react';

export const InsightsAlertsBanner: React.FC = () => {
  const { setCurrentView, setActiveContractId } = useContracts();

  const handleInspectPalantir = () => {
    setActiveContractId('cnt-palantir-02');
    setCurrentView('analysis');
  };

  return (
    <div className="rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-gradient-to-r from-rose-50 via-white to-rose-50/30 dark:from-rose-950/40 dark:via-slate-900/70 dark:to-slate-900/90 p-5 shadow-sm dark:shadow-lg backdrop-blur transition-colors">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Autonomous Contract Alert
              </span>
              <span className="rounded-full bg-rose-100 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-[10px] font-mono text-rose-700 dark:text-rose-300 px-2 py-0.5 font-semibold">
                Urgent Action Needed
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-1 tracking-tight">
              Uncapped Indemnification Clause Detected in Palantir AI Licensing Agreement
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-3xl">
              AI analysis identified non-standard Section 14.2 exposing enterprise to unbounded third-party liability for generative AI model outputs. 
              Legal Counsel has paused approval workflow pending redline insertion of standard 2x ACV ceiling ($6.4M).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
          <button
            onClick={handleInspectPalantir}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/20 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <span>Inspect Clause 14.2</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
