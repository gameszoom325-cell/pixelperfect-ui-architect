export type ContractCategory = 'MSA' | 'SOW' | 'SLA' | 'DPA' | 'NDA' | 'Vendor Agreement' | 'Cloud Licensing';

export type ContractStatus = 'Active' | 'Pending Review' | 'Under Ingestion' | 'Expiring Soon' | 'Terminated' | 'Draft';

export type RiskTier = 'Low' | 'Medium' | 'High' | 'Critical';

export type ClauseCategory = 
  | 'Financial & Payment'
  | 'Service Level Agreement (SLA)'
  | 'Data Privacy & Compliance'
  | 'Termination & Renewal'
  | 'Liability & Indemnification'
  | 'Intellectual Property'
  | 'Audit & Reporting';

export type ObligationStatus = 'Pending' | 'In Progress' | 'Fulfilled' | 'At Risk' | 'Overdue';

export type ObligationPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ActionSystem = 'Jira' | 'SAP / ERP' | 'Slack' | 'Google Calendar' | 'Salesforce' | 'ServiceNow';

export interface ActionItem {
  id: string;
  title: string;
  system: ActionSystem;
  status: 'Draft' | 'Queued' | 'Executed' | 'Failed';
  assignedTo: string;
  dueDate: string;
  payloadSummary: string;
  executedAt?: string;
}

export interface ExtractedClause {
  id: string;
  category: ClauseCategory;
  clauseNumber: string;
  title: string;
  rawText: string;
  aiSummary: string;
  pageNumber: number;
  highlightCoordinates?: { top: number; left: number; width: number; height: number };
  confidence: number; // e.g. 98.5
  riskTier: RiskTier;
  riskReasoning?: string;
  isStandard: boolean;
  actionItems: ActionItem[];
  obligationsExtractedCount: number;
}

export type ObligationReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_review';

export type ObligationType = 
  | 'payment' 
  | 'delivery' 
  | 'reporting' 
  | 'confidentiality' 
  | 'compliance' 
  | 'termination' 
  | 'renewal' 
  | 'SLA' 
  | 'other';

export interface SuggestedTask {
  title: string;
  description: string;
  suggested_owner_role: string;
  suggested_due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Obligation {
  id: string;
  contractId: string;
  contractTitle: string;
  counterparty: string;
  title: string;
  description: string;
  category: ClauseCategory;
  status: ObligationStatus;
  priority: ObligationPriority;
  dueDate: string;
  recurring?: 'One-time' | 'Monthly' | 'Quarterly' | 'Annually';
  assignedTo: {
    name: string;
    email: string;
    avatar?: string;
    department: string;
  };
  linkedClauseId: string;
  clauseCitation: string;
  penaltyClause?: string;
  fulfillmentProof?: string;
  updatedAt: string;

  // Prompt #4 AI Extraction & Human Approval Fields
  clause_reference?: string;
  source_quote?: string;
  obligated_party?: string;
  beneficiary_party?: string;
  obligation_summary?: string;
  type?: ObligationType;
  deadline?: string;
  normalized_due_date?: string | null;
  recurrence?: 'one-time' | 'monthly' | 'quarterly' | 'annual' | null;
  amount?: number | null;
  currency?: string | null;
  risk_level?: 'low' | 'medium' | 'high';
  risk_reason?: string;
  confidence?: number;
  review_status?: ObligationReviewStatus;
  rejection_reason?: string;
  approval_comment?: string;
  reviewer_delegated_to?: string;
  approved_at?: string;
  suggested_task?: SuggestedTask;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done';

export interface BusinessTask {
  id: string;
  obligationId: string;
  title: string;
  description?: string;
  linkedClause: string;
  contractId: string;
  contractTitle: string;
  counterparty: string;
  owner: string;
  ownerRole: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: TaskStatus;
  notes: string;
  sourceQuote: string;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface ApprovalStep {
  stepNumber: number;
  role: string;
  assigneeName: string;
  assigneeEmail: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Delegated' | 'Waiting';
  timestamp?: string;
  comments?: string;
  signatureStamp?: string;
}

export interface ApprovalWorkflow {
  id: string;
  contractId: string;
  contractTitle: string;
  counterparty: string;
  dealValue: string;
  requestedBy: string;
  department: string;
  submittedAt: string;
  currentStepIndex: number;
  overallStatus: 'Pending Review' | 'Approved' | 'Changes Requested' | 'Rejected';
  priority: ObligationPriority;
  flaggedClausesCount: number;
  riskScore: number; // 0 - 100
  steps: ApprovalStep[];
  notes?: string;
}

export interface Contract {
  id: string;
  title: string;
  contractNumber: string;
  category: ContractCategory;
  status: ContractStatus;
  counterparty: string;
  counterpartyLogo?: string;
  effectiveDate: string;
  expirationDate: string;
  autoRenew: boolean;
  renewalNoticeDays: number;
  totalValue: number;
  currency: string;
  department: string;
  ownerName: string;
  ownerEmail: string;
  riskTier: RiskTier;
  riskScore: number; // 0 - 100
  documentUrl?: string;
  pageCount: number;
  summary: string;
  clauses: ExtractedClause[];
  obligations: Obligation[];
  approvalWorkflow?: ApprovalWorkflow;
  uploadedAt: string;
  ingestionConfidence: number;
  tags: string[];
}

export interface IngestionTask {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  progress: number;
  currentStage: 'Uploading' | 'OCR Scanning' | 'Semantic Chunking' | 'Clause Extraction' | 'Action Pipeline Generation' | 'Completed' | 'Error';
  extractedClausesCount: number;
  confidenceScore: number;
  category: ContractCategory;
  department: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  type: 'Approval' | 'Extraction' | 'Obligation' | 'System' | 'Ingestion';
}
