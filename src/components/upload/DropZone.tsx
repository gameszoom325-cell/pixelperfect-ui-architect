import React, { useState, useRef } from 'react';
import { useContracts } from '../../context/ContractContext';
import { ContractCategory } from '../../types/contract';
import { 
  UploadCloud, 
  Settings2, 
  Sparkles,
  FileText,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';

export const DropZone: React.FC = () => {
  const { ingestContractWithAI, setCurrentView } = useContracts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; content?: string } | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ContractCategory>('Cloud Licensing');
  const [selectedDepartment, setSelectedDepartment] = useState('Engineering & Data Platforms');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    const sizeStr = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    setSelectedFile({
      name: file.name,
      size: sizeStr
    });
    setErrorMessage(null);

    // If text file, read text
    if (file.name.endsWith('.txt') || file.type.includes('text')) {
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        setSelectedFile(prev => prev ? { ...prev, content: text } : null);
      };
      reader.readAsText(file);
    }
  };

  const handleStartExtraction = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    let fileName = 'Contract_Agreement.pdf';
    let fileSize = '1.2 MB';
    let textToAnalyze: string | undefined = undefined;

    if (inputMode === 'paste') {
      if (!pastedText.trim()) {
        setErrorMessage('Please paste contract text to proceed with AI obligation extraction.');
        setIsProcessing(false);
        return;
      }
      fileName = `${selectedCategory.replace(/\s+/g, '_')}_Pasted_Agreement.txt`;
      fileSize = `${(new Blob([pastedText]).size / 1024).toFixed(1)} KB`;
      textToAnalyze = pastedText;
    } else {
      if (!selectedFile) {
        setErrorMessage('Please select or drop a contract file before starting analysis.');
        setIsProcessing(false);
        return;
      }
      fileName = selectedFile.name;
      fileSize = selectedFile.size;
      textToAnalyze = selectedFile.content;
    }

    const result = await ingestContractWithAI({
      fileName,
      fileSize,
      contractText: textToAnalyze,
      category: selectedCategory,
      department: selectedDepartment
    });

    setIsProcessing(false);

    if (result.success) {
      setSelectedFile(null);
      setPastedText('');
    } else {
      setErrorMessage(result.error || 'AI extraction failed. You can retry below.');
    }
  };

  // Sample templates for fast paste testing
  const loadSampleText = (type: 'sla' | 'payment' | 'indemnity') => {
    if (type === 'sla') {
      setPastedText(`MASTER CLOUD SLA & SUPPORT COVENANT
Section 3.1 99.99% Availability: Provider warrants not less than 99.99% uptime each calendar month for all production API clusters. If availability falls between 99.0% and 99.98%, Customer is entitled to a 15% billing credit; below 99.0%, Customer receives a 30% credit, claimable within forty-five (45) days of month-end.
Section 5.2 Scheduled Maintenance: Provider shall provide minimum seven (7) calendar days advance written notice of any scheduled maintenance window.
Section 11.4 Termination for Breaches: Failure to meet 99.9% uptime for three (3) consecutive billing cycles grants Customer immediate right to terminate without penalty.`);
      setSelectedCategory('SLA');
    } else if (type === 'payment') {
      setPastedText(`CAPACITY RESERVATION & COMMERCIAL PAYMENT TERMS
Section 4.1 Invoicing Schedule: Customer shall remit monthly advance capacity reservation fees of $85,000 within thirty (30) days of invoice date (Net 30).
Section 4.3 True-Up Reconciliations: In the event compute credit consumption exceeds committed allocation by >10%, a quarterly true-up invoice shall be rendered at $2.85 per additional compute unit.
Section 6.2 Late Charges: Unsettled balances beyond forty-five (45) days incur statutory interest of 1.5% per month.`);
      setSelectedCategory('Financial & Payment' as any);
    } else {
      setPastedText(`ENTERPRISE AI MODEL LICENSE & ASYMMETRIC INDEMNITY
Section 12.3 Intellectual Property: Bespoke model weights fine-tuned on Customer proprietary datasets shall vest solely in Customer upon milestone sign-off.
Section 14.2 Consequential Liability: Notwithstanding any other provision, Customer shall defend and hold harmless Provider against all third-party claims arising from algorithmic outputs without any monetary liability cap.
Section 16.1 Non-Renewal: Either party may opt out of auto-renewal by giving written notice at least sixty (60) days prior to anniversary.`);
      setSelectedCategory('Vendor Agreement');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 backdrop-blur shadow-sm dark:shadow-xl transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Document Ingestion & AI Optical Extraction</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload PDF, DOCX, TXT files or paste contract clauses to automatically extract legally grounded obligations.
          </p>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('paste')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'paste'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Paste Contract Text</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <strong>Extraction Error:</strong> {errorMessage}
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartExtraction}
            className="flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-300 hover:underline shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Grid: Upload / Paste on left, Settings on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: File Dropzone OR Text Area */}
        <div className="lg:col-span-2 space-y-4">
          {inputMode === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload contract file area"
              onKeyDown={e => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
              className={`flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer group text-center focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' 
                  : selectedFile
                  ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-400 dark:hover:border-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.tiff"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Select contract file input"
              />

              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm group-hover:scale-105 transition-all ${
                selectedFile 
                  ? 'bg-emerald-50 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 border-emerald-300'
                  : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-700'
              }`}>
                {selectedFile ? <FileText className="h-8 w-8" /> : <UploadCloud className="h-8 w-8" />}
              </div>

              {selectedFile ? (
                <div className="mt-4">
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                    FILE SELECTED
                  </span>
                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Size: {selectedFile.size} · Click or drag another file to replace
                  </p>
                </div>
              ) : (
                <>
                  <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                    Drag & drop contract PDF, DOCX, TXT or click to browse
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                    Supports scanned and digital documents (PDF, DOCX, TXT). Grounded extraction without inventing dates or amounts.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700/80 font-mono">PDF</span>
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700/80 font-mono">DOCX</span>
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700/80 font-mono">TXT</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Paste Text Area */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Paste Raw Legal Text or Clauses:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono">{pastedText.length} chars · {pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0} words</span>
                  {pastedText && (
                    <button
                      type="button"
                      onClick={() => setPastedText('')}
                      className="text-xs text-rose-600 hover:underline font-medium ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={9}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="Paste contract provisions here (e.g., Section 4.2 Payment Terms, Section 9.1 SLA guarantee, Section 12.3 Non-Renewal notification)..."
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />

              {/* Sample Templates */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500 font-medium">Quick Sample Clauses:</span>
                <button
                  type="button"
                  onClick={() => loadSampleText('sla')}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  99.99% Cloud SLA
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleText('payment')}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Net 30 & True-Up
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleText('indemnity')}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Uncapped Indemnity
                </button>
              </div>
            </div>
          )}

          {/* Trigger Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Extracted items route to Human Approval Queue for verification.
            </span>

            <button
              type="button"
              onClick={handleStartExtraction}
              disabled={isProcessing || (inputMode === 'upload' && !selectedFile) || (inputMode === 'paste' && !pastedText.trim())}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md transition-all active:scale-95 ${
                isProcessing || (inputMode === 'upload' && !selectedFile) || (inputMode === 'paste' && !pastedText.trim())
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Extracting Obligations...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Contract with Gemini AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Ingestion Parameters Form */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Settings2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Extraction Configuration</span>
          </div>

          <div>
            <label htmlFor="upload-cat" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Contract Classification
            </label>
            <select
              id="upload-cat"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as ContractCategory)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Cloud Licensing">Cloud Licensing Agreement</option>
              <option value="Vendor Agreement">Vendor / Supplier Agreement</option>
              <option value="MSA">Master Services Agreement (MSA)</option>
              <option value="DPA">Data Processing Addendum (DPA)</option>
              <option value="SOW">Statement of Work (SOW)</option>
              <option value="NDA">Non-Disclosure Agreement (NDA)</option>
            </select>
          </div>

          <div>
            <label htmlFor="upload-dept" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Owning Business Unit
            </label>
            <select
              id="upload-dept"
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Engineering & Data Platforms">Engineering & Data Platforms</option>
              <option value="Enterprise AI & Automation">Enterprise AI & Automation</option>
              <option value="Cloud Infrastructure & SRE">Cloud Infrastructure & SRE</option>
              <option value="Treasury & Revenue Operations">Treasury & Revenue Operations</option>
              <option value="Corporate Legal & Risk">Corporate Legal & Risk</option>
              <option value="Cybersecurity Operations">Cybersecurity Operations</option>
            </select>
          </div>

          <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 p-3 text-xs text-blue-900 dark:text-blue-300 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Prompt #4 Grounding Rules</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-800 dark:text-blue-300">
              <li>Every item grounded in an exact source quote</li>
              <li>Confidence &lt; 0.70 flagged for review</li>
              <li>High-risk items require human comment</li>
              <li>Tasks generated only upon approval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
