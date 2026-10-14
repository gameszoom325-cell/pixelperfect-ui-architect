import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { Obligation, ObligationStatus, ClauseCategory } from '../../types/contract';
import { ObligationStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { 
  Search, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Download,
  ShieldCheck
} from 'lucide-react';

interface ObligationsTableProps {
  onOpenNewModal: () => void;
}

export const ObligationsTable: React.FC<ObligationsTableProps> = ({ onOpenNewModal }) => {
  const { obligations, updateObligationStatus, setActiveContractId, setCurrentView, addToast } = useContracts();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fulfill proof modal
  const [fulfillingObligation, setFulfillingObligation] = useState<Obligation | null>(null);
  const [fulfillmentProof, setFulfillmentProof] = useState('');

  const filteredObligations = obligations.filter(o => {
    const matchesSearch = 
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.contractTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || o.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleInspectContract = (contractId: string) => {
    setActiveContractId(contractId);
    setCurrentView('analysis');
  };

  const handleStatusChange = (ob: Obligation, newStatus: ObligationStatus) => {
    if (newStatus === 'Fulfilled') {
      setFulfillingObligation(ob);
      setFulfillmentProof(`Audit Proof Verified: REF-${new Date().toISOString().slice(0, 10)}-PASS`);
    } else {
      updateObligationStatus(ob.id, newStatus);
    }
  };

  const confirmFulfill = () => {
    if (fulfillingObligation) {
      updateObligationStatus(fulfillingObligation.id, 'Fulfilled', fulfillmentProof);
      setFulfillingObligation(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Obligation Title', 'Contract Title', 'Counterparty', 'Category', 'Status', 'Priority', 'Due Date', 'Assignee', 'Department'];
    const rows = filteredObligations.map(o => [
      `"${o.title}"`,
      `"${o.contractTitle}"`,
      `"${o.counterparty}"`,
      o.category,
      o.status,
      o.priority,
      o.dueDate,
      `"${o.assignedTo.name}"`,
      o.assignedTo.department
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Obligations_Tracker_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Obligations Exported',
      message: `Exported ${filteredObligations.length} obligations to CSV.`
    });
  };

  const categories: ClauseCategory[] = [
    'Financial & Payment',
    'Service Level Agreement (SLA)',
    'Data Privacy & Compliance',
    'Termination & Renewal',
    'Liability & Indemnification',
    'Audit & Reporting'
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur overflow-hidden shadow-sm dark:shadow-xl transition-colors">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            Contractual Obligations & Milestone Ledger
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track, fulfill, and audit time-sensitive clauses across active agreements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            aria-label="Export obligations to CSV"
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span>+ Add Obligation</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search obligation, assignee, contract..."
            aria-label="Search obligations"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          aria-label="Filter obligations by category"
          className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter obligations by status"
          className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="At Risk">At Risk</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4">Obligation & Citation</th>
              <th className="py-3 px-4">Contract / Vendor</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Assigned Owner</th>
              <th className="py-3 px-4">Status & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
            {filteredObligations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                  <p className="font-medium text-slate-800 dark:text-slate-300">No obligations matched your criteria</p>
                </td>
              </tr>
            ) : (
              filteredObligations.map(ob => {
                const isOverdue = ob.status === 'Overdue';

                return (
                  <tr key={ob.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Title & Citation */}
                    <td className="py-3.5 px-4 min-w-[260px]">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {ob.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {ob.description}
                      </div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-1 flex flex-wrap items-center gap-1">
                        <span>{ob.clauseCitation}</span>
                        {ob.penaltyClause && (
                          <span className="text-rose-600 dark:text-rose-400 ml-2">⚠️ {ob.penaltyClause}</span>
                        )}
                        {ob.fulfillmentProof && (
                          <span className="text-emerald-700 dark:text-emerald-400 ml-2 font-mono flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            {ob.fulfillmentProof}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contract Title */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div 
                        onClick={() => handleInspectContract(ob.contractId)}
                        className="font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1"
                      >
                        <span className="truncate max-w-[180px]">{ob.contractTitle}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {ob.counterparty}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {ob.category}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className={`font-mono flex items-center gap-1.5 ${
                        isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{ob.dueDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ob.recurring || 'One-time'}
                      </div>
                    </td>

                    {/* Assigned Owner */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                          {ob.assignedTo.name.slice(0, 1)}
                        </div>
                        <span>{ob.assignedTo.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ob.assignedTo.department}
                      </div>
                    </td>

                    {/* Status & Inline Switcher */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        aria-label={`Status for ${ob.title}`}
                        value={ob.status}
                        onChange={e => handleStatusChange(ob, e.target.value as ObligationStatus)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer focus:outline-none ${
                          ob.status === 'Fulfilled'
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                            : ob.status === 'Overdue'
                            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                            : ob.status === 'At Risk'
                            ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                            : ob.status === 'In Progress'
                            ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="At Risk">At Risk</option>
                        <option value="Fulfilled">Fulfilled</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Fulfill Confirmation & Proof Modal */}
      <Modal
        isOpen={Boolean(fulfillingObligation)}
        onClose={() => setFulfillingObligation(null)}
        title="Confirm Obligation Fulfillment"
        subtitle={fulfillingObligation?.title}
        maxWidth="md"
        footer={
          <>
            <button
              onClick={() => setFulfillingObligation(null)}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={confirmFulfill}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Confirm Fulfillment & Sign
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Record completion proof for <strong>{fulfillingObligation?.title}</strong> under contract{' '}
            <strong>{fulfillingObligation?.contractTitle}</strong>.
          </p>

          <div>
            <label htmlFor="fulfill-proof" className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Fulfillment Verification Memo / Certificate Ref
            </label>
            <input
              id="fulfill-proof"
              type="text"
              value={fulfillmentProof}
              onChange={e => setFulfillmentProof(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
