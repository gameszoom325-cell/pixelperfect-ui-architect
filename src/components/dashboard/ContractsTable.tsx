import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { Contract, ContractCategory, RiskTier, ContractStatus } from '../../types/contract';
import { RiskBadge, ContractStatusBadge } from '../common/Badge';
import { 
  Search, 
  FileText, 
  ArrowUpDown, 
  Calendar, 
  ChevronRight,
  Sparkles,
  Download
} from 'lucide-react';

export const ContractsTable: React.FC = () => {
  const { contracts, setActiveContractId, setCurrentView, addToast } = useContracts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'totalValue' | 'expirationDate' | 'title'>('totalValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtering
  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesRisk = riskFilter === 'all' || c.riskTier === riskFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesRisk && matchesStatus;
  });

  // Sorting
  const sortedContracts = [...filteredContracts].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'totalValue') {
      comparison = a.totalValue - b.totalValue;
    } else if (sortField === 'expirationDate') {
      comparison = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    } else {
      comparison = a.title.localeCompare(b.title);
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const toggleSort = (field: 'totalValue' | 'expirationDate' | 'title') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleInspectContract = (contractId: string) => {
    setActiveContractId(contractId);
    setCurrentView('analysis');
  };

  const handleExportCSV = () => {
    const headers = ['Contract Number', 'Title', 'Counterparty', 'Category', 'Value (USD)', 'Status', 'Risk Tier', 'Expiration Date', 'Obligations Count'];
    const rows = sortedContracts.map(c => [
      c.contractNumber,
      `"${c.title}"`,
      `"${c.counterparty}"`,
      c.category,
      c.totalValue,
      c.status,
      c.riskTier,
      c.expirationDate,
      c.obligations.length
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Contract2Action_Portfolio_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Portfolio Exported',
      message: `Exported ${sortedContracts.length} contract records to CSV.`
    });
  };

  const categories: ContractCategory[] = ['Cloud Licensing', 'Vendor Agreement', 'MSA', 'DPA', 'SOW'];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur overflow-hidden shadow-sm dark:shadow-xl transition-colors">
      {/* Header with Title & Controls */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Active Contract Portfolio
            </h3>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {sortedContracts.length} agreements
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Real-time compliance monitoring, extracted obligations, and automated action status
          </p>
        </div>

        {/* Export & Quick Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            aria-label="Export contracts to CSV"
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setCurrentView('upload')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ingest Agreement</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by vendor, title, or contract ID..."
            aria-label="Search contracts"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
          className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Risk Filter */}
        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          aria-label="Filter by risk tier"
          className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="all">All Risk Tiers</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
          <option value="Critical">Critical Risk</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Expiring Soon">Expiring Soon</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4">Contract & Counterparty</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('totalValue')}>
                <div className="flex items-center gap-1">
                  <span>Commitment</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('expirationDate')}>
                <div className="flex items-center gap-1">
                  <span>Expiration & Term</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4">Risk Profile</th>
              <th className="py-3 px-4">Obligations</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
            {sortedContracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                  <p className="font-medium text-slate-800 dark:text-slate-300">No contracts matched the selected filters</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting the search terms or category selector</p>
                </td>
              </tr>
            ) : (
              sortedContracts.map(c => {
                const formattedPrice = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: c.currency,
                  maximumFractionDigits: 0
                }).format(c.totalValue);

                const overdueCount = c.obligations.filter(o => o.status === 'Overdue').length;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleInspectContract(c.id)}
                  >
                    {/* Title & Counterparty */}
                    <td className="py-3.5 px-4 min-w-[240px]">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 shrink-0 mt-0.5">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                            <span>{c.contractNumber}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-700 dark:text-slate-300 font-sans">{c.counterparty}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="rounded bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                        {c.category}
                      </span>
                    </td>

                    {/* Commitment Value */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {formattedPrice}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {c.department}
                      </div>
                    </td>

                    {/* Expiration Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{c.expirationDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {c.autoRenew ? `Auto-renews (${c.renewalNoticeDays}d notice)` : 'Fixed non-renewing'}
                      </div>
                    </td>

                    {/* Risk Profile */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RiskBadge tier={c.riskTier} score={c.riskScore} />
                    </td>

                    {/* Obligations */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-900 dark:text-white">
                          {c.obligations.length}
                        </span>
                        {overdueCount > 0 ? (
                          <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/60 rounded px-1.5 py-0.5 font-semibold">
                            {overdueCount} Overdue
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {c.clauses.length} clauses
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleInspectContract(c.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <span>Deep Inspect</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
