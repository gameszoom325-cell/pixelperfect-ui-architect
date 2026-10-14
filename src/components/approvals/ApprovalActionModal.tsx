import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { ApprovalWorkflow } from '../../types/contract';
import { Modal } from '../common/Modal';
import { CheckCircle2, XCircle, AlertTriangle, PenTool } from 'lucide-react';

interface ApprovalActionModalProps {
  workflow: ApprovalWorkflow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  workflow,
  isOpen,
  onClose
}) => {
  const { processApprovalStep, currentUserRole } = useContracts();

  const [decision, setDecision] = useState<'Approve' | 'Reject' | 'Request Changes'>('Approve');
  const [comments, setComments] = useState('');
  const [signerPin, setSignerPin] = useState('7719');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !workflow) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      setErrorMsg('Please enter reviewer notes or negotiation reasoning before confirming.');
      return;
    }
    if (decision === 'Approve' && !signerPin.trim()) {
      setErrorMsg('Please enter your 4-digit signer passcode to authenticate PKI signature.');
      return;
    }
    setErrorMsg('');
    processApprovalStep(workflow.id, decision, comments);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Governance Decision"
      subtitle={`Acting as ${currentUserRole} for ${workflow.contractTitle}`}
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
              decision === 'Approve'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : decision === 'Reject'
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            Confirm & Record {decision}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Error notification if validation fails */}
        {errorMsg && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 p-2.5 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Decision Toggle */}
        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-2 uppercase text-[10px] tracking-wider">
            Select Governance Ruling
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDecision('Approve')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                decision === 'Approve'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-slate-900 dark:text-white ring-1 ring-emerald-500 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-xs">Approve & Sign</span>
            </button>

            <button
              type="button"
              onClick={() => setDecision('Request Changes')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                decision === 'Request Changes'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-slate-900 dark:text-white ring-1 ring-amber-500 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-xs">Request Redline</span>
            </button>

            <button
              type="button"
              onClick={() => setDecision('Reject')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                decision === 'Reject'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-slate-900 dark:text-white ring-1 ring-rose-500 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <span className="font-semibold text-xs">Reject Deal</span>
            </button>
          </div>
        </div>

        {/* Legal Feedback Comments */}
        <div>
          <label htmlFor="decision-comments" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reviewer Findings & Negotiation Rationale
          </label>
          <textarea
            id="decision-comments"
            rows={3}
            required
            value={comments}
            onChange={e => {
              setComments(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder={
              decision === 'Approve'
                ? 'Standard pricing and risk profile verified. Authorized for execution.'
                : 'State specific clause numbers, required indemnity cap amendments, or billing conditions...'
            }
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Digital Signature Authentication PIN */}
        {decision === 'Approve' && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-semibold text-xs">
              <PenTool className="h-4 w-4" />
              <span>PKI Cryptographic Authorization Seal</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Applying binding corporate authorization stamp on behalf of <strong>{currentUserRole}</strong>.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                id="signer-pin"
                type="password"
                maxLength={4}
                value={signerPin}
                onChange={e => setSignerPin(e.target.value)}
                className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1 text-xs text-center font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none"
              />
              <label htmlFor="signer-pin" className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Signer Passcode (Demo: 7719)</label>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
