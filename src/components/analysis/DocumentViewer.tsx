import React, { useState, useEffect } from 'react';
import { Contract, ExtractedClause } from '../../types/contract';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  FileText, 
  Bookmark,
  Sparkles
} from 'lucide-react';

interface DocumentViewerProps {
  contract: Contract;
  activeClauseId: string | null;
  onSelectClause: (clauseId: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  contract,
  activeClauseId,
  onSelectClause
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInDoc, setSearchInDoc] = useState('');

  // Reset page when contract changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchInDoc('');
  }, [contract.id]);

  const activeClause = contract.clauses.find(c => c.id === activeClauseId) || contract.clauses[0];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 75));

  const highlightMatches = (text: string) => {
    if (!searchInDoc.trim()) return text;
    const parts = text.split(new RegExp(`(${searchInDoc})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchInDoc.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-slate-900 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-xl dark:shadow-2xl">
      {/* Top Document Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[280px]">
            {contract.contractNumber}.pdf
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] hidden sm:inline">
            ({contract.pageCount} pages · Verified OCR)
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Document In-Viewer Search */}
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInDoc}
              onChange={e => setSearchInDoc(e.target.value)}
              placeholder="Filter text..."
              aria-label="Filter text in document viewer"
              className="w-36 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-2.5 py-1 text-[11px] text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 p-0.5 rounded"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1">
              Page {currentPage} / {contract.pageCount}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, contract.pageCount))}
              disabled={currentPage >= contract.pageCount}
              aria-label="Next page"
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 p-0.5 rounded"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-1.5 py-0.5 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 w-10 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Document Render Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/90 flex justify-center">
        <div
          className="bg-white text-slate-900 rounded-lg shadow-xl dark:shadow-2xl p-8 sm:p-12 w-full max-w-2xl font-serif text-xs sm:text-sm leading-relaxed transition-all duration-200 select-text relative border border-slate-200 dark:border-transparent"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {/* Header Watermark & Metadata */}
          <div className="border-b border-slate-300 pb-4 mb-6 font-sans flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <span className="font-bold text-slate-800 uppercase tracking-wider">
                CONFIDENTIAL LEGAL INSTRUMENT
              </span>
              <div className="text-[10px] font-mono mt-0.5">
                EXECUTION COPY · {contract.contractNumber}
              </div>
            </div>
            <div className="text-right font-mono text-[10px]">
              Page {currentPage} of {contract.pageCount}
            </div>
          </div>

          {/* Document Title Header */}
          <div className="text-center mb-8 font-sans">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight uppercase">
              {highlightMatches(contract.title)}
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-serif italic">
              Between {highlightMatches(contract.counterparty)} and Enterprise Corporation
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Effective as of {contract.effectiveDate}
            </p>
          </div>

          {/* Legal Document Preamble */}
          <div className="space-y-4 text-justify font-serif text-[12px] sm:text-[13px] leading-6 text-slate-800">
            <p>
              This Master Agreement (&ldquo;Agreement&rdquo;) is entered into by and between{' '}
              <strong>{highlightMatches(contract.counterparty)}</strong>, a corporation organized under governing laws, and{' '}
              <strong>Enterprise Corporation</strong>, having its principal place of business at 100 Financial Center Blvd.
            </p>
            
            <p>
              WHEREAS, Customer desires to procure specialized operational software, compute infrastructure, and automated services, and Provider agrees to deliver such services under the terms set forth herein.
            </p>

            {/* Render Simulated Clauses with Highlight Bounding Boxes */}
            {contract.clauses.map(clause => {
              const isSelected = clause.id === activeClause?.id;
              const isCritical = clause.riskTier === 'Critical' || clause.riskTier === 'High';

              return (
                <div
                  key={clause.id}
                  onClick={() => onSelectClause(clause.id)}
                  className={`relative p-3.5 rounded-lg border transition-all cursor-pointer my-4 ${
                    isSelected
                      ? isCritical
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/40 shadow-sm'
                        : 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/40 shadow-sm'
                      : isCritical
                      ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-blue-50/40 hover:border-blue-200'
                  }`}
                >
                  {/* Floating AI Pin Tag */}
                  <div className="flex items-center justify-between font-sans text-[10px] mb-1.5">
                    <span className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                      <Bookmark className="h-3 w-3 text-blue-600" />
                      {clause.clauseNumber} — {clause.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.2 rounded font-mono font-medium ${
                        isCritical ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {clause.riskTier} Risk
                      </span>
                      <span className="bg-slate-200 text-slate-700 font-mono px-1 rounded">
                        {clause.confidence}% Conf
                      </span>
                    </div>
                  </div>

                  <p className="font-serif text-[12px] text-slate-900 leading-relaxed italic">
                    &ldquo;{highlightMatches(clause.rawText)}&rdquo;
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-200 font-sans text-[11px] flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 font-medium text-blue-700">
                      <Sparkles className="h-3 w-3" />
                      AI Extracted: {clause.category}
                    </span>
                    <span className="text-[10px] text-slate-500">Click to inspect action pipeline</span>
                  </div>
                </div>
              );
            })}

            <p>
              NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows.
            </p>
          </div>

          {/* Signature Block Simulation */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 font-sans text-xs">
            <div>
              <div className="font-bold text-slate-800">{contract.counterparty}</div>
              <div className="mt-6 border-b border-slate-400 pb-1 font-mono text-[11px] text-slate-600">
                /s/ Authorized Signatory
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Authorized Representative</div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Enterprise Corporation</div>
              <div className="mt-6 border-b border-slate-400 pb-1 font-mono text-[11px] text-slate-600">
                /s/ Victoria Sterling, CFO
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Authorized Corporate Officer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
