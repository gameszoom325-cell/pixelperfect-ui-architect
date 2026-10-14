import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { Modal } from '../common/Modal';
import { ClauseCategory, ObligationPriority } from '../../types/contract';

interface NewObligationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewObligationModal: React.FC<NewObligationModalProps> = ({ isOpen, onClose }) => {
  const { contracts, addObligation } = useContracts();

  const [contractId, setContractId] = useState(contracts[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ClauseCategory>('Financial & Payment');
  const [priority, setPriority] = useState<ObligationPriority>('High');
  const [dueDate, setDueDate] = useState('2026-06-30');
  const [assigneeName, setAssigneeName] = useState('Marcus Vance');
  const [department, setDepartment] = useState('Finance');
  const [clauseCitation, setClauseCitation] = useState('Section 4.3 (True-Up Verification)');
  const [penaltyClause, setPenaltyClause] = useState('');

  const selectedContract = contracts.find(c => c.id === contractId) || contracts[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addObligation({
      contractId,
      contractTitle: selectedContract.title,
      counterparty: selectedContract.counterparty,
      title,
      description,
      category,
      status: 'Pending',
      priority,
      dueDate,
      recurring: 'One-time',
      assignedTo: {
        name: assigneeName,
        email: `${assigneeName.toLowerCase().replace(' ', '.')}@enterprise.corp`,
        department
      },
      linkedClauseId: 'cls-manual',
      clauseCitation,
      penaltyClause
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Contract Obligation"
      subtitle="Define actionable milestone, recurring compliance audit, or financial SLA"
      maxWidth="xl"
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
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Create & Link Obligation
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label htmlFor="modal-linked-contract" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Linked Contract
          </label>
          <select
            id="modal-linked-contract"
            value={contractId}
            onChange={e => setContractId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
          >
            {contracts.map(c => (
              <option key={c.id} value={c.id}>
                {c.contractNumber} — {c.title} ({c.counterparty})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="modal-ob-title" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Obligation Title
          </label>
          <input
            id="modal-ob-title"
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Annual SOC2 Type II Audit Attestation Delivery"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="modal-ob-desc" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description & Scope
          </label>
          <textarea
            id="modal-ob-desc"
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detailed description of deliverables, acceptance criteria, or compliance evidence..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="modal-ob-cat" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              id="modal-ob-cat"
              value={category}
              onChange={e => setCategory(e.target.value as ClauseCategory)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Financial & Payment">Financial & Payment</option>
              <option value="Service Level Agreement (SLA)">Service Level Agreement (SLA)</option>
              <option value="Data Privacy & Compliance">Data Privacy & Compliance</option>
              <option value="Termination & Renewal">Termination & Renewal</option>
              <option value="Audit & Reporting">Audit & Reporting</option>
            </select>
          </div>

          <div>
            <label htmlFor="modal-ob-pri" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              id="modal-ob-pri"
              value={priority}
              onChange={e => setPriority(e.target.value as ObligationPriority)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="modal-ob-due" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              id="modal-ob-due"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="modal-ob-owner" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assigned Lead
            </label>
            <input
              id="modal-ob-owner"
              type="text"
              value={assigneeName}
              onChange={e => setAssigneeName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="modal-ob-cite" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Clause Citation Tag
            </label>
            <input
              id="modal-ob-cite"
              type="text"
              value={clauseCitation}
              onChange={e => setClauseCitation(e.target.value)}
              placeholder="e.g. Section 16.4"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="modal-ob-penalty" className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Penalty / Breach Covenant
            </label>
            <input
              id="modal-ob-penalty"
              type="text"
              value={penaltyClause}
              onChange={e => setPenaltyClause(e.target.value)}
              placeholder="e.g. 1.5% monthly late interest"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
