import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { Obligation, SuggestedTask } from '../../types/contract';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  UserCheck, 
  Filter, 
  Search, 
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  Quote
} from 'lucide-react';

export const ObligationApprovalQueue: React.FC = () => {
  const { 
    obligations, 
    approveObligation, 
    rejectObligation, 
    editAndApproveObligation, 
    requestColleagueReview, 
    bulkApproveLowRiskObligations, 
    bulkRejectSelectedObligations,
    setCurrentView
  } = useContracts();

  // Active filter tab
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'rejected' | 'needs_review' | 'high_risk' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [rejectModalOb, setRejectModalOb] = useState<Obligation | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [editModalOb, setEditModalOb] = useState<Obligation | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    ownerRole: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    approvalComment: string;
  }>({
    title: '',
    ownerRole: '',
    dueDate: '',
    priority: 'medium',
    approvalComment: ''
  });

  const [reviewModalOb, setReviewModalOb] = useState<Obligation | null>(null);
  const [colleagueEmail, setColleagueEmail] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  const [highRiskApproveOb, setHighRiskApproveOb] = useState<Obligation | null>(null);
  const [highRiskComment, setHighRiskComment] = useState('');
  const [highRiskError, setHighRiskError] = useState('');

  // Bulk reject modal
  const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  // Filter logic
  const filteredObligations = obligations.filter(ob => {
    // Tab filter
    if (filterTab === 'pending') {
      if (ob.review_status && ob.review_status !== 'pending' && ob.review_status !== 'needs_review') return false;
    } else if (filterTab === 'approved') {
      if (ob.review_status !== 'approved') return false;
    } else if (filterTab === 'rejected') {
      if (ob.review_status !== 'rejected') return false;
    } else if (filterTab === 'needs_review') {
      const isLowConf = ob.confidence !== undefined && ob.confidence < 0.70;
      if (ob.review_status !== 'needs_review' && !isLowConf) return false;
    } else if (filterTab === 'high_risk') {
      const isHigh = ob.risk_level === 'high' || ob.priority === 'Critical';
      if (!isHigh) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ob.title.toLowerCase().includes(q);
      const matchQuote = (ob.source_quote || '').toLowerCase().includes(q);
      const matchContract = ob.contractTitle.toLowerCase().includes(q);
      const matchCitation = (ob.clause_reference || ob.clauseCitation || '').toLowerCase().includes(q);
      const matchCounterparty = (ob.counterparty || '').toLowerCase().includes(q);
      if (!matchTitle && !matchQuote && !matchContract && !matchCitation && !matchCounterparty) return false;
    }

    return true;
  });

  // Tab counts
  const pendingCount = obligations.filter(o => o.review_status === 'pending' || o.review_status === 'needs_review' || !o.review_status).length;
  const approvedCount = obligations.filter(o => o.review_status === 'approved').length;
  const rejectedCount = obligations.filter(o => o.review_status === 'rejected').length;
  const needsReviewCount = obligations.filter(o => o.review_status === 'needs_review' || (o.confidence !== undefined && o.confidence < 0.70)).length;
  const highRiskCount = obligations.filter(o => o.risk_level === 'high' || o.priority === 'Critical').length;
  const pendingLowRiskCount = obligations.filter(o => (o.review_status === 'pending' || !o.review_status) && o.risk_level === 'low').length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredObligations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredObligations.map(o => o.id));
    }
  };

  const handleApproveClick = (ob: Obligation) => {
    const isHigh = ob.risk_level === 'high' || ob.priority === 'Critical';
    if (isHigh) {
      setHighRiskApproveOb(ob);
      setHighRiskComment('');
      setHighRiskError('');
    } else {
      approveObligation(ob.id);
    }
  };

  const submitHighRiskApproval = () => {
    if (!highRiskComment.trim()) {
      setHighRiskError('Written approval comment is mandatory for high-risk obligations.');
      return;
    }
    if (highRiskApproveOb) {
      approveObligation(highRiskApproveOb.id, highRiskComment.trim());
      setHighRiskApproveOb(null);
      setHighRiskComment('');
      setHighRiskError('');
    }
  };

  const openEditModal = (ob: Obligation) => {
    setEditModalOb(ob);
    setEditForm({
      title: ob.suggested_task?.title || ob.title,
      ownerRole: ob.suggested_task?.suggested_owner_role || ob.assignedTo.department,
      dueDate: ob.suggested_task?.suggested_due_date || ob.dueDate,
      priority: ob.suggested_task?.priority || (ob.priority.toLowerCase() as any) || 'medium',
      approvalComment: ''
    });
  };

  const submitEditApproval = () => {
    if (!editModalOb) return;
    editAndApproveObligation(editModalOb.id, {
      title: editForm.title,
      ownerRole: editForm.ownerRole,
      dueDate: editForm.dueDate,
      priority: editForm.priority
    }, editForm.approvalComment || undefined);
    setEditModalOb(null);
  };

  const openRejectModal = (ob: Obligation) => {
    setRejectModalOb(ob);
    setRejectionReason('');
  };

  const submitRejection = () => {
    if (!rejectModalOb || !rejectionReason.trim()) return;
    rejectObligation(rejectModalOb.id, rejectionReason.trim());
    setRejectModalOb(null);
    setRejectionReason('');
  };

  const openReviewModal = (ob: Obligation) => {
    setReviewModalOb(ob);
    setColleagueEmail('colleague.counsel@enterprise.corp');
    setReviewNote('');
  };

  const submitReviewRequest = () => {
    if (!reviewModalOb || !colleagueEmail.trim()) return;
    requestColleagueReview(reviewModalOb.id, colleagueEmail.trim(), reviewNote.trim());
    setReviewModalOb(null);
    setColleagueEmail('');
    setReviewNote('');
  };

  const handleBulkRejectSubmit = () => {
    if (selectedIds.length === 0 || !bulkRejectReason.trim()) return;
    bulkRejectSelectedObligations(selectedIds, bulkRejectReason.trim());
    setSelectedIds([]);
    setIsBulkRejectOpen(false);
    setBulkRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm dark:shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="h-4 w-4" />
                HUMAN APPROVAL GATEWAY
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded px-2 py-0.5">
                Zero Autonomous Execution Guarantee
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Extracted Obligations Approval Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every obligation extracted from contracts requires explicit human authorization before creating business tasks.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('obligations')}
            className="self-start md:self-center flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Layers className="h-4 w-4" />
            <span>Go to Task Board →</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-800/80 mt-5 pt-4">
          <button
            onClick={() => setFilterTab('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterTab === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('approved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterTab === 'approved'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approved ({approvedCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('needs_review')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterTab === 'needs_review'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Needs Review ({needsReviewCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('high_risk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterTab === 'high_risk'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>High Risk ({highRiskCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('rejected')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterTab === 'rejected'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Rejected ({rejectedCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterTab === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All ({obligations.length})</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="select-all"
            checked={filteredObligations.length > 0 && selectedIds.length === filteredObligations.length}
            onChange={toggleSelectAll}
            aria-label="Select all displayed obligations"
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="select-all" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Select All ({selectedIds.length} selected)
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk approve low-risk items */}
          <button
            onClick={() => bulkApproveLowRiskObligations()}
            disabled={pendingLowRiskCount === 0}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
              pendingLowRiskCount > 0
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
            title="Approve all low-risk items in pending state"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approve Low-Risk ({pendingLowRiskCount})</span>
          </button>

          {/* Bulk reject selected */}
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkRejectOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Reject Selected ({selectedIds.length})</span>
            </button>
          )}

          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter quote, clause, party..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* High-risk notice pill */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Governance Enforcement:</strong> High-risk obligations require a written approval comment and cannot be bulk-approved.
        </span>
      </div>

      {/* Obligation Cards Grid / List */}
      {filteredObligations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white/50 dark:bg-slate-900/30">
          <ShieldCheck className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No obligations matching filter</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try switching tabs or adjusting search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredObligations.map(ob => {
            const isSelected = selectedIds.includes(ob.id);
            const isHighRisk = ob.risk_level === 'high' || ob.priority === 'Critical';
            const isApproved = ob.review_status === 'approved';
            const isRejected = ob.review_status === 'rejected';
            const isNeedsReview = ob.review_status === 'needs_review' || (ob.confidence !== undefined && ob.confidence < 0.70);

            return (
              <div
                key={ob.id}
                className={`rounded-2xl border p-5 backdrop-blur transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
                } ${
                  isHighRisk 
                    ? 'border-rose-300 dark:border-rose-900/60 bg-gradient-to-r from-rose-50/50 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900'
                    : isNeedsReview
                    ? 'border-amber-300 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900'
                    : isApproved
                    ? 'border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900/70'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm'
                }`}
              >
                {/* Header Row: Checkbox, Clause Citation, Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(ob.id)}
                      aria-label={`Select obligation ${ob.title}`}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />

                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                      {ob.clause_reference || ob.clauseCitation}
                    </span>

                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[220px] sm:max-w-xs">
                      {ob.contractTitle}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    {isApproved ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        APPROVED
                      </span>
                    ) : isRejected ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        REJECTED
                      </span>
                    ) : isNeedsReview ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-amber-600" />
                        NEEDS REVIEW
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        PENDING APPROVAL
                      </span>
                    )}

                    {/* Risk Badge */}
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isHighRisk 
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : ob.risk_level === 'medium'
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {(ob.risk_level || 'LOW').toUpperCase()} RISK
                    </span>

                    {/* Confidence */}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {Math.round((ob.confidence || 0.98) * 100)}% Conf
                    </span>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
                  {/* Left Column: AI Summary & Grounded Source Quote */}
                  <div className="lg:col-span-7 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {ob.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {ob.obligation_summary || ob.description}
                      </p>
                    </div>

                    {/* Source Quote Grounding Box */}
                    {ob.source_quote && (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 p-3 relative">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          <Quote className="h-3 w-3 text-blue-500" />
                          <span>Exact Source Contract Quote</span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-serif italic leading-relaxed">
                          &ldquo;{ob.source_quote}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Parties and Meta Chips */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      {ob.obligated_party && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Obligated: <strong>{ob.obligated_party}</strong>
                        </span>
                      )}
                      {ob.beneficiary_party && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Beneficiary: <strong>{ob.beneficiary_party}</strong>
                        </span>
                      )}
                      {ob.type && (
                        <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Type: {ob.type}
                        </span>
                      )}
                      {ob.deadline && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Deadline: {ob.deadline}
                        </span>
                      )}
                    </div>

                    {/* Risk Reason if applicable */}
                    {ob.risk_reason && (
                      <div className="text-[11px] text-rose-700 dark:text-rose-400 flex items-start gap-1 font-medium bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-200/50 dark:border-rose-900/40">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span><strong>Risk Rationale:</strong> {ob.risk_reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Suggested Task & Approver Controls */}
                  <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          Suggested Business Task
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Due: {ob.suggested_task?.suggested_due_date || ob.dueDate}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {ob.suggested_task?.title || ob.title}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Role: <strong className="text-slate-700 dark:text-slate-300">{ob.suggested_task?.suggested_owner_role || ob.assignedTo.department}</strong>
                      </div>

                      {ob.approval_comment && (
                        <div className="mt-2 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded border border-emerald-200 dark:border-emerald-800 font-serif italic">
                          Approved with comment: &ldquo;{ob.approval_comment}&rdquo;
                        </div>
                      )}

                      {ob.rejection_reason && (
                        <div className="mt-2 text-[11px] text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2 rounded border border-rose-200 dark:border-rose-800 font-serif italic">
                          Rejection Reason: &ldquo;{ob.rejection_reason}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Zone */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                      {!isApproved && !isRejected && (
                        <>
                          <button
                            onClick={() => handleApproveClick(ob)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-semibold shadow-sm active:scale-95 transition-all"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => openEditModal(ob)}
                            className="flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            title="Edit task title, owner, due date before approving"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          <button
                            onClick={() => openReviewModal(ob)}
                            className="flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            title="Request review from a colleague"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => openRejectModal(ob)}
                            className="flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2.5 py-2 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                            title="Reject with a reason"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <div className="w-full flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Task Active on Execution Board
                          </span>
                          <button
                            onClick={() => setCurrentView('obligations')}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>View Task</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {isRejected && (
                        <div className="w-full text-xs text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                          <XCircle className="h-4 w-4" /> Obligation Rejected (No task generated)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Mandatory Comment for High-Risk Approval */}
      {/* ------------------------------------------------------------- */}
      {highRiskApproveOb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
              <span>High-Risk Governance Authorization Required</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              You are authorizing a high-risk contractual obligation (<strong>{highRiskApproveOb.title}</strong>). Enterprise policy requires a written approval justification.
            </p>

            <div className="mt-4">
              <label htmlFor="high-risk-comment" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Written Approval Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="high-risk-comment"
                rows={3}
                value={highRiskComment}
                onChange={e => {
                  setHighRiskComment(e.target.value);
                  if (highRiskError) setHighRiskError('');
                }}
                placeholder="e.g. Approved following review with Commercial Counsel; business accepts risk under FY26 risk waiver..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              {highRiskError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{highRiskError}</p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setHighRiskApproveOb(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={submitHighRiskApproval}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-semibold shadow-sm"
              >
                Sign Off & Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Edit Then Approve Modal */}
      {/* ------------------------------------------------------------- */}
      {editModalOb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-blue-600" />
                Edit Task Parameters Before Approval
              </h3>
              <button
                onClick={() => setEditModalOb(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Task Title
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Owner / Role
                </label>
                <input
                  type="text"
                  value={editForm.ownerRole}
                  onChange={e => setEditForm({ ...editForm, ownerRole: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={editForm.priority}
                onChange={e => setEditForm({ ...editForm, priority: e.target.value as any })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Approval Note (Logged in Audit Log)
              </label>
              <input
                type="text"
                value={editForm.approvalComment}
                onChange={e => setEditForm({ ...editForm, approvalComment: e.target.value })}
                placeholder="Optional notes or modifications justification"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditModalOb(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={submitEditApproval}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-sm"
              >
                Save & Approve Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: Rejection Reason Modal */}
      {/* ------------------------------------------------------------- */}
      {rejectModalOb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <XCircle className="h-5 w-5" />
              <span>Reject Obligation</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Provide a rationale for rejecting <strong>{rejectModalOb.title}</strong>. This decision will be permanently logged in the audit trail.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Non-binding recitals clause / Duplicate of master SLA commitment / Counterparty waived requirement..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalOb(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={!rejectionReason.trim()}
                className={`rounded-xl px-4 py-2 text-xs font-semibold shadow-sm ${
                  rejectionReason.trim()
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: Request Colleague Review Modal */}
      {/* ------------------------------------------------------------- */}
      {reviewModalOb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <UserCheck className="h-5 w-5" />
              <span>Request Peer Review from Colleague</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Flag <strong>{reviewModalOb.title}</strong> for colleague review and commentary.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Colleague Work Email
              </label>
              <input
                type="email"
                value={colleagueEmail}
                onChange={e => setColleagueEmail(e.target.value)}
                placeholder="colleague@enterprise.corp"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Review Context & Questions
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="e.g. Please verify whether the 15% SLA threshold aligns with our multi-cloud DR protocol..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setReviewModalOb(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={submitReviewRequest}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-sm"
              >
                Dispatch Review Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: Bulk Reject Modal */}
      {/* ------------------------------------------------------------- */}
      {isBulkRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <XCircle className="h-5 w-5" />
              <span>Reject {selectedIds.length} Selected Obligations</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Provide a reason for rejecting the {selectedIds.length} selected obligations.
            </p>

            <textarea
              rows={3}
              value={bulkRejectReason}
              onChange={e => setBulkRejectReason(e.target.value)}
              placeholder="e.g. Duplicate obligations / Obsolete terms in superseded agreement..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsBulkRejectOpen(false)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkRejectSubmit}
                disabled={!bulkRejectReason.trim()}
                className={`rounded-xl px-4 py-2 text-xs font-semibold shadow-sm ${
                  bulkRejectReason.trim()
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                Reject All Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
