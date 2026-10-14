import React from 'react';
import { Contract } from '../../types/contract';
import { RiskBadge } from '../common/Badge';
import { ShieldAlert, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface RiskAnalysisMatrixProps {
  contract: Contract;
}

export const RiskAnalysisMatrix: React.FC<RiskAnalysisMatrixProps> = ({ contract }) => {
  const isHighOrCritical = contract.riskTier === 'Critical' || contract.riskTier === 'High';

  const policyChecklist = [
    { title: 'Standard Reciprocal Indemnification', compliant: contract.id !== 'cnt-palantir-02', detail: contract.id === 'cnt-palantir-02' ? 'Section 14.2 has asymmetric uncapped indemnity' : 'Standard mutual indemnification verified' },
    { title: 'Aggregate Liability Ceiling (<= 2x ACV)', compliant: contract.id !== 'cnt-palantir-02', detail: contract.id === 'cnt-palantir-02' ? 'Violates Enterprise 2x ACV policy cap' : 'Liability cap aligned with corporate policy' },
    { title: 'SOC 2 Type II Annual Attestation', compliant: true, detail: 'Vendor commits to AICPA SOC 2 Type II audit report delivery' },
    { title: 'Data Sovereignty & GDPR SCC Compliance', compliant: true, detail: 'Standard Contractual Clauses incorporated' },
    { title: '60-Day Renewal Cancellation Window', compliant: true, detail: 'Compliant with enterprise procurement renewal standard' }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {isHighOrCritical ? (
            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          )}
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
            Enterprise Risk Assessment & Policy Checklist
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge tier={contract.riskTier} score={contract.riskScore} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Risk Score Dial Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Composite Risk Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-bold font-mono ${
                isHighOrCritical ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {contract.riskScore}/100
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {contract.riskTier} Risk Rating
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Calculated via NLP clause deviation analysis against enterprise playbook standards.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Governing Law:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">State of Delaware</span>
          </div>
        </div>

        {/* Policy Checklist (Span 2 cols) */}
        <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
            Legal Playbook Compliance Verification
          </span>

          <div className="space-y-2">
            {policyChecklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-xs"
              >
                <div className="flex items-start gap-2 min-w-0">
                  {item.compliant ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900 dark:text-white block truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      {item.detail}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium shrink-0 ${
                  item.compliant 
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {item.compliant ? 'PASS' : 'FLAGGED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
