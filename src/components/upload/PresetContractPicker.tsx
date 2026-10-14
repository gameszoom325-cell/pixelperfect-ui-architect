import React from 'react';
import { useContracts } from '../../context/ContractContext';
import { PRESET_SAMPLE_CONTRACTS } from '../../data/mockContracts';
import { Sparkles, ArrowRight } from 'lucide-react';

export const PresetContractPicker: React.FC = () => {
  const { startIngestion } = useContracts();

  const handleSelectPreset = (preset: typeof PRESET_SAMPLE_CONTRACTS[0]) => {
    startIngestion(preset.fileName, preset.fileSize, preset.category, preset.department);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Preset Enterprise Agreement Samples (1-Click Test)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test instant ingestion pipeline simulation with pre-configured legal document packages
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {PRESET_SAMPLE_CONTRACTS.map(preset => {
          const formattedVal = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          }).format(preset.totalValue);

          return (
            <div
              key={preset.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/70 p-4 hover:border-blue-400 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 font-medium text-[10px]">
                    {preset.category}
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {preset.pageCount} Pages · {preset.fileSize}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {preset.title}
                </h4>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  {preset.counterparty}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {preset.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {formattedVal}
                </span>

                <button
                  onClick={() => handleSelectPreset(preset)}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span>Ingest Sample</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
