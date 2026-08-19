// ── Alethia domain types (mirrors the Implementation data model) ──────────

export type Role = "employee" | "manager" | "legal";
export type Department =
  | "Engineering"
  | "Customer Support"
  | "Operations"
  | "Product"
  | "Finance"
  | "Legal & Compliance"
  | "People";

export interface User {
  id: string;
  name: string;
  email: string;
  title: string;
  role: Role;
  department: Department;
  managerId: string | null;
  status: "active" | "onboarding";
  sensitiveAccess: boolean;
  avatarTone: number; // 0–7, picks a deterministic avatar color
  onboarding?: boolean;
}

export type DocStatus =
  | "current"
  | "needs-review"
  | "draft"
  | "superseded";

export type RiskLevel = "critical" | "high" | "medium" | "low";

export type AccessScope = "all" | "legal" | "engineering" | "support" | "operations";

export interface DocumentRecord {
  id: string;
  title: string;
  category: string;
  ownerId: string;
  department: Department;
  version: string;
  status: DocStatus;
  effectiveDate: string; // ISO date
  reviewDate: string; // ISO date
  supersedesId: string | null;
  accessScope: AccessScope;
  summary: string;
  body: string; // seeded content, markdown-lite
  affectedCount: number;
  riskLevel: RiskLevel | "none";
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  publishedAt: string; // ISO datetime
  note: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  section: string;
  content: string;
  keywords: string[];
  answer: string; // composed grounded answer for retrieval
  accessScope: AccessScope;
}

export type ChangeSeverity = "critical" | "high" | "medium" | "low";

export interface DocChange {
  id: string;
  section: string;
  severity: ChangeSeverity;
  explanation: string;
  previousText: string;
  newText: string;
  affectedRoles: string[];
}

export interface ChangeSet {
  id: string;
  documentId: string;
  fromVersion: string;
  toVersion: string;
  detectedAt: string; // ISO datetime
  changes: DocChange[];
  affectedUserIds: string[];
  highRiskUserIds: string[];
  status: "analyzed" | "campaign-started";
}

export interface LearningStep {
  id: string;
  title: string;
  kind: "read" | "review" | "example" | "scenario";
  minutes: number;
  body: string;
  citation?: { documentId: string; section: string; excerpt: string };
}

export interface LearningPath {
  id: string;
  title: string;
  documentId: string;
  role: string;
  department: string | null;
  estimatedMinutes: number;
  required: boolean;
  steps: LearningStep[];
}

export type AssignmentStatus =
  | "assigned"
  | "in_progress"
  | "completed"
  | "overdue"
  | "failed";

export interface Assignment {
  id: string;
  userId: string;
  documentId: string;
  learningPathId: string | null;
  campaignId: string | null;
  type: "learning" | "verification";
  status: AssignmentStatus;
  assignedAt: string;
  dueAt: string;
  completedAt: string | null;
  stepsDone: string[]; // learning step ids
  score: number | null; // verification %
}

export interface VerificationQuestion {
  id: string;
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation: { documentId: string; section: string; excerpt: string };
}

export interface VerificationAttempt {
  id: string;
  userId: string;
  documentId: string;
  assignmentId: string;
  score: number; // percent
  passed: boolean;
  attemptedAt: string;
  answers: { questionId: string; chosen: number; correct: boolean }[];
}

export type RiskType =
  | "unverified-access"
  | "overdue-verification"
  | "stale-document"
  | "failed-verification"
  | "knowledge-gap";

export interface KnowledgeRisk {
  id: string;
  type: RiskType;
  severity: "critical" | "high" | "medium";
  documentId: string | null;
  userId: string | null;
  title: string;
  description: string;
  recommendedAction: string;
  status: "open" | "mitigated" | "resolved";
  detectedAt: string;
  resolvedAt: string | null;
}

export type AgentTaskType =
  | "reminder"
  | "escalation"
  | "assignment"
  | "manager-notify"
  | "suggest-learning";

export interface AgentTask {
  id: string;
  type: AgentTaskType;
  targetUserId: string | null;
  managerUserId: string | null;
  relatedRiskId: string | null;
  documentId: string | null;
  title: string;
  detail: string;
  status: "scheduled" | "sent" | "done";
  dueAt: string;
  executedAt: string | null;
}

export interface AuditEvent {
  id: string;
  actorType: "user" | "ai" | "agent" | "system";
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  detail: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  documentId: string;
  changeSetId: string;
  title: string;
  createdBy: string;
  startedAt: string;
  dueAt: string;
  audienceUserIds: string[];
  status: "active" | "completed";
}

export interface AgentLogEntry {
  id: string;
  at: string;
  actor: "AI" | "Agent" | "System";
  title: string;
  detail: string;
  documentId?: string | null;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  evidence: { label: string; href: string }[];
  confidence: "high" | "medium";
}

export interface Store {
  resetAt: string;
  users: User[];
  documents: DocumentRecord[];
  versions: DocumentVersion[];
  chunks: DocumentChunk[];
  changeSets: ChangeSet[];
  learningPaths: LearningPath[];
  assignments: Assignment[];
  attempts: VerificationAttempt[];
  risks: KnowledgeRisk[];
  agentTasks: AgentTask[];
  auditEvents: AuditEvent[];
  campaigns: Campaign[];
  agentLog: AgentLogEntry[];
  publishedV3: boolean;
}
