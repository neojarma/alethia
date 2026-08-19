export type DemoRole = "manager" | "employee" | "developer" | "legal";
export type AccountRole = "org_admin" | "manager" | "member";

export interface Division {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface ClientAccount {
  id: string;
  organizationId: string;
  divisionId: string | null;
  name: string;
  email: string;
  passwordHash: string;
  accountRole: AccountRole;
  functionalRole: DemoRole;
  title: string;
  status: "active" | "invited";
  createdAt: string;
}

export interface ClientSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
}

export interface StoredDocument {
  id: string;
  title: string;
  version: string;
  department: string;
  access: DemoRole[];
  content: string;
  chunks: { section: string; content: string; tokens: string[] }[];
  createdAt: string;
  organizationId?: string;
  divisionId?: string | null;
  source?: { connectorId: string; externalId: string; url: string };
  contentHash?: string;
  lastSyncedAt?: string;
}

export interface CampaignRecord {
  id: string;
  documentId: string;
  title: string;
  audience: number;
  dueAt: string;
  status: "active" | "completed";
  createdAt: string;
  targetUserIds?: string[];
  department?: string | null;
  targetRoles?: DemoRole[];
  organizationId?: string;
  divisionId?: string | null;
  policy?: {
    passingScore: number;
    maxAttempts: number;
    questionCount: number;
    randomizeQuestions: boolean;
    certificationDays: number;
    reminderDaysBefore: number;
    escalateAfterDays: number;
  };
}

export interface KnowledgeQuestion {
  question: string;
  scenario: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation: string;
}

export interface DocumentAnalysis {
  documentId: string;
  summary: string;
  businessImpact: string;
  keyChanges: string[];
  affectedDepartments: string[];
  affectedRoles: DemoRole[];
  questions: KnowledgeQuestion[];
  provider: string;
  model: string;
  createdAt: string;
  approvalStatus?: "pending_review" | "approved" | "rejected";
  approvedBy?: string | null;
  approvedAt?: string | null;
  approvalComment?: string;
}

export interface KnowledgeAssignment {
  id: string;
  campaignId: string;
  documentId: string;
  userId: string;
  status: "assigned" | "completed" | "failed";
  dueAt: string;
  score: number | null;
  completedAt: string | null;
  createdAt: string;
  remediation?: {
    status: "assigned" | "completed";
    summary: string;
    citations: string[];
    retryAvailableAt: string;
    createdAt: string;
  };
}

export interface ImpactEvidence {
  id: string;
  campaignId: string;
  organizationId?: string;
  baselineReadiness: number;
  currentReadiness: number;
  manualHoursBefore: number;
  hoursWithAlethia: number;
  risksClosed: number;
  gapsDiscovered: number;
  managerQuote: string;
  managerName: string;
  evidenceSource: string;
  updatedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  assignmentId: string;
  title: string;
  detail: string;
  read: boolean;
  createdAt: string;
}

export interface Database {
  divisions: Division[];
  clientAccounts: ClientAccount[];
  clientSessions: ClientSession[];
  users: {
    id: string;
    name: string;
    role: DemoRole;
    department: string;
    sensitiveAccess: boolean;
    verified: boolean;
  }[];
  documents: StoredDocument[];
  campaigns: CampaignRecord[];
  risks: {
    id: string;
    title: string;
    severity: "critical" | "high" | "medium";
    status: "open" | "resolved";
    documentId: string;
  }[];
  audit: {
    id: string;
    actor: string;
    action: string;
    detail: string;
    createdAt: string;
    organizationId?: string;
  }[];
  agentTasks: {
    id: string;
    type: string;
    status: "scheduled" | "sent";
    detail: string;
    createdAt: string;
  }[];
  verifications: {
    id: string;
    userId: string;
    documentId: string;
    score: number;
    passed: boolean;
    createdAt: string;
    assignmentId?: string;
    expiresAt?: string | null;
  }[];
  documentAnalyses: DocumentAnalysis[];
  knowledgeAssignments: KnowledgeAssignment[];
  notifications: UserNotification[];
  impactEvidence: ImpactEvidence[];
  analytics: {
    id: string;
    event: string;
    role: DemoRole;
    metadata: Record<string, string | number | boolean>;
    createdAt: string;
  }[];
  connectors: {
    id: string;
    type: "google-drive" | "sharepoint" | "confluence" | "notion" | "github" | "jira" | "lms";
    name: string;
    status: "connected" | "paused" | "error";
    lastSyncAt: string | null;
    config: Record<string, string>;
    createdAt: string;
    organizationId?: string;
    divisionId?: string | null;
    schedule: "manual" | "hourly" | "daily" | "weekly";
    nextSyncAt: string | null;
  }[];
  syncRuns: {
    id: string;
    connectorId: string;
    status: "completed" | "failed";
    imported: number;
    updated: number;
    unchanged: number;
    changesCreated: number;
    startedAt: string;
    completedAt: string;
    organizationId?: string;
  }[];
  teams: {
    id: string;
    name: string;
    department: string;
    managerId: string;
    memberIds: string[];
  }[];
  sso: {
    enabled: boolean;
    provider: "oidc" | "saml";
    issuer: string;
    clientId: string;
    allowedDomain: string;
  };
  governance: {
    citationRequired: boolean;
    minConfidence: number;
    humanApprovalForCritical: boolean;
    retentionDays: number;
    allowedModels: string[];
    allowedProviders: string[];
    blockBelowConfidence: boolean;
    crossDivisionIsolation: boolean;
    requirePromptAudit: boolean;
  };
  documentVersions: {
    id: string;
    documentId: string;
    version: string;
    content: string;
    contentHash: string;
    sourceUrl: string;
    capturedAt: string;
  }[];
  changeIntelligence: {
    id: string;
    documentId: string;
    fromVersion: string;
    toVersion: string;
    summary: string;
    added: string[];
    removed: string[];
    affectedRoles: DemoRole[];
    affectedUserIds: string[];
    severity: "critical" | "high" | "medium" | "low";
    requiresReverification: boolean;
    status: "pending-review" | "approved" | "campaign-created";
    createdAt: string;
  }[];
  aiDecisionLogs: {
    id: string;
    action: string;
    provider: string;
    model: string;
    confidence: number;
    sources: string[];
    promptHash: string;
    decision: "allowed" | "blocked" | "needs-approval";
    approvedBy: string | null;
    createdAt: string;
  }[];
  modelRegistry: {
    id: string;
    provider: string;
    model: string;
    version: string;
    status: "approved" | "evaluation" | "blocked";
    evalScore: number;
  }[];
  auditSchedules: {
    id: string;
    name: string;
    cadence: "daily" | "weekly" | "monthly";
    enabled: boolean;
    lastRunAt: string | null;
  }[];
  governanceFindings: {
    id: string;
    type: "conflict" | "stale" | "missing-citation" | "access";
    severity: "critical" | "high" | "medium";
    title: string;
    detail: string;
    status: "open" | "resolved";
    createdAt: string;
  }[];
  departmentAgents: {
    id: string;
    name: string;
    department: string;
    enabled: boolean;
    actions: string[];
    escalationRole: DemoRole;
    lastRunAt: string | null;
  }[];
  evaluations: {
    id: string;
    modelId: string;
    score: number;
    passed: boolean;
    cases: number;
    createdAt: string;
  }[];
  organizations: {
    id: string;
    name: string;
    slug: string;
    status: "active" | "suspended";
    createdAt: string;
  }[];
  memberships: {
    id: string;
    organizationId: string;
    userId: string;
    role: "owner" | "admin" | "member";
  }[];
  subscriptions: {
    organizationId: string;
    plan: "starter" | "business" | "enterprise";
    status: "active" | "trial";
    seats: number;
    renewalAt: string;
  }[];
  usage: {
    organizationId: string;
    documents: number;
    queries: number;
    seats: number;
    syncs: number;
  }[];
  featureFlags: { organizationId: string; key: string; enabled: boolean }[];
  workflowTemplates: {
    id: string;
    industry: "fintech" | "healthcare" | "logistics" | "saas";
    name: string;
    description: string;
    documents: string[];
    campaigns: string[];
    agentActions: string[];
  }[];
}
