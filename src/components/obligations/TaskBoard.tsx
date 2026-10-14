import React, { useState } from 'react';
import { useContracts } from '../../context/ContractContext';
import { BusinessTask, TaskStatus } from '../../types/contract';
import { 
  Kanban, 
  Table, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  FileText, 
  Plus, 
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  MoreVertical,
  Check
} from 'lucide-react';

export const TaskBoard: React.FC = () => {
  const { 
    businessTasks, 
    updateTaskStatus, 
    updateTask, 
    addTaskNote, 
    setActiveContractId, 
    setCurrentView 
  } = useContracts();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'contract'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Note edit modal
  const [noteModalTask, setNoteModalTask] = useState<BusinessTask | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Priority weight for sorting
  const priorityWeight: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const now = new Date();

  // Helper for overdue / due-soon calculation
  const getDeadlineStatus = (dueDateStr: string, isDone: boolean) => {
    if (isDone) return { label: 'Completed', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
    const due = new Date(dueDateStr);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        label: `Overdue by ${Math.abs(diffDays)}d`, 
        isOverdue: true,
        color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800' 
      };
    } else if (diffDays <= 3) {
      return { 
        label: `Due in ${diffDays === 0 ? 'today' : `${diffDays}d`}`, 
        isDueSoon: true,
        color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' 
      };
    }
    return { 
      label: dueDateStr, 
      color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
    };
  };

  // Filter & Sort
  const filteredTasks = businessTasks
    .filter(t => {
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchContract = t.contractTitle.toLowerCase().includes(q);
        const matchOwner = t.owner.toLowerCase().includes(q) || t.ownerRole.toLowerCase().includes(q);
        const matchNotes = (t.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchContract && !matchOwner && !matchNotes) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dueDate') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        comparison = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'contract') {
        comparison = a.contractTitle.localeCompare(b.contractTitle);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const columns: { id: TaskStatus; title: string; color: string; badgeColor: string }[] = [
    { 
      id: 'To Do', 
      title: 'To Do', 
      color: 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    },
    { 
      id: 'In Progress', 
      title: 'In Progress', 
      color: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
    },
    { 
      id: 'Blocked', 
      title: 'Blocked', 
      color: 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20',
      badgeColor: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
    },
    { 
      id: 'Done', 
      title: 'Done', 
      color: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
    }
  ];

  const handleInspectContract = (contractId: string) => {
    setActiveContractId(contractId);
    setCurrentView('analysis');
  };

  const handleSaveNote = () => {
    if (!noteModalTask || !newNoteText.trim()) return;
    addTaskNote(noteModalTask.id, newNoteText.trim());
    setNoteModalTask(null);
    setNewNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: View Switcher, Search, Filters, Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Table Ledger</span>
          </button>
        </div>

        {/* Right: Search, Priority Filter, Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks, owners..."
              className="w-48 sm:w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
            <option value="contract">Sort by Contract</option>
          </select>

          {/* Direction toggle */}
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            aria-label="Toggle sort direction"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: KANBAN BOARD */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-2xl border ${col.color} p-4 backdrop-blur shadow-sm dark:shadow-lg min-h-[550px] transition-colors`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {col.title}
                  </span>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${col.badgeColor}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {colTasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No tasks in this lane
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const deadline = getDeadlineStatus(task.dueDate, task.status === 'Done');

                      return (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-md transition-all group"
                        >
                          {/* Card Top: Priority & Due Date */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                              task.priority === 'critical'
                                ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : task.priority === 'high'
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}>
                              {task.priority}
                            </span>

                            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${deadline.color}`}>
                              <Calendar className="h-3 w-3" />
                              <span>{deadline.label}</span>
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </h4>

                          {/* Linked Clause & Contract */}
                          <div 
                            onClick={() => handleInspectContract(task.contractId)}
                            className="mt-1.5 text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-mono truncate"
                            title={`Inspect ${task.contractTitle}`}
                          >
                            <FileText className="h-3 w-3 shrink-0" />
                            <span className="truncate">{task.linkedClause}</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
                          </div>

                          {/* Owner & Department */}
                          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span>Owner: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{task.owner}</strong></span>
                            <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{task.ownerRole}</span>
                          </div>

                          {/* Notes Preview if any */}
                          {task.notes && (
                            <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2">
                              {task.notes}
                            </div>
                          )}

                          {/* Card Footer: Quick Move Controls & Note button */}
                          <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            {/* Note button */}
                            <button
                              onClick={() => {
                                setNoteModalTask(task);
                                setNewNoteText('');
                              }}
                              className="text-[11px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                              title="Add activity note"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>Notes</span>
                            </button>

                            {/* State Selector Dropdown */}
                            <select
                              value={task.status}
                              onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Blocked">Blocked</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: TABLE LEDGER */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Business Task</th>
                  <th className="py-3 px-4 font-semibold">Contract & Clause</th>
                  <th className="py-3 px-4 font-semibold">Owner & Role</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No business tasks found matching search filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    const deadline = getDeadlineStatus(task.dueDate, task.status === 'Done');

                    return (
                      <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Status Select */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={task.status}
                            onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Blocked">Blocked</option>
                            <option value="Done">Done</option>
                          </select>
                        </td>

                        {/* Title */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs">
                          <div className="truncate">{task.title}</div>
                          {task.notes && (
                            <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                              {task.notes}
                            </div>
                          )}
                        </td>

                        {/* Contract */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div 
                            onClick={() => handleInspectContract(task.contractId)}
                            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-mono font-medium"
                          >
                            {task.linkedClause}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {task.contractTitle}
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{task.owner}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{task.ownerRole}</div>
                        </td>

                        {/* Due Date Indicator */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                          <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${deadline.color}`}>
                            {deadline.label}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${
                            task.priority === 'critical'
                              ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : task.priority === 'high'
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setNoteModalTask(task);
                              setNewNoteText('');
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Add Note
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
      )}

      {/* ------------------------------------------------------------- */}
      {/* NOTE MODAL */}
      {/* ------------------------------------------------------------- */}
      {noteModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Add Activity Log or Note
              </h3>
              <button
                onClick={() => setNoteModalTask(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {noteModalTask.title}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {noteModalTask.linkedClause}
              </p>
            </div>

            {noteModalTask.notes && (
              <div className="max-h-36 overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line border border-slate-200 dark:border-slate-800">
                {noteModalTask.notes}
              </div>
            )}

            <div>
              <label htmlFor="new-note" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Note / Execution Progress
              </label>
              <textarea
                id="new-note"
                rows={3}
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Log progress, ticket numbers, or blockers..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setNoteModalTask(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!newNoteText.trim()}
                className={`rounded-xl px-4 py-2 text-xs font-semibold shadow-sm ${
                  newNoteText.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
