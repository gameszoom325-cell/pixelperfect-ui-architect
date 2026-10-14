import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { Shield, Search, Download } from 'lucide-react';

export const AuditGovernanceLog: React.FC = () => {
  const { auditLogs, addToast } = useContracts();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleExportAudit = () => {
    const headers = ['Timestamp', 'User Role', 'Action', 'Target Record', 'Details', 'Audit Class'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      `"${l.user}"`,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${l.details}"`,
      l.type
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Contract2Action_Governance_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Audit Trail Exported',
      message: `Downloaded ${filteredLogs.length} immutable governance records.`
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Immutable Governance & Compliance Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tamper-evident chronological log of all approvals, overrides, and automated webhook executions
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="py-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, contract, or action..."
            aria-label="Search audit trail"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          aria-label="Filter audit events by type"
          className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Events</option>
          <option value="Approval">Approval Decisions</option>
          <option value="Extraction">AI Extractions</option>
          <option value="Obligation">Obligation Updates</option>
          <option value="System">System & Webhooks</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Authorized Actor</th>
              <th className="py-2.5 px-3">Action Event</th>
              <th className="py-2.5 px-3">Target Object</th>
              <th className="py-2.5 px-3">Verification Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors font-mono text-[11px]">
                <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {log.user}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    log.type === 'Approval' ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                    log.type === 'Obligation' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                    log.type === 'System' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium whitespace-nowrap truncate max-w-[200px]">
                  {log.target}
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-sans max-w-md truncate">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
