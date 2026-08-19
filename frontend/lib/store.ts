import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomBytes, scryptSync } from "node:crypto";
import type { Database } from "./domain";
import { chunkDocument } from "./knowledge-engine";

declare global {
  var _alethia_memory_db: Database | undefined;
}

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "alethia.json");
const tmpFile = path.join(os.tmpdir(), "alethia.json");


function seed(): Database {
  const hashPassword = (password: string) => {
    const salt = randomBytes(16).toString("hex");
    return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  };
  const content = `Section 4.2 · Privileged data access\nRoles handling customer PII must complete an access review every 90 days. Reviews require manager approval and an immutable audit record.\n\nSection 6.1 · Incident notification\nSuspected customer-data exposure must be reported to Security and Legal within 30 minutes.\n\nSection 8.4 · Third-party exports\nExports require manager and Data Protection approval with a retained audit record.`;
  const apiStandard = `Section 3.1 · Service authentication\nProduction services must use short-lived workload identities. Static API keys are prohibited in application repositories and must be rotated through the approved secrets manager.\n\nSection 5.2 · Privileged changes\nAuthentication changes require peer review, passing security checks and an auditable deployment approval.`;
  const incidentRunbook = `Section 2.1 · Engineering incident response\nThe on-call developer must acknowledge a production security incident within 10 minutes, notify the incident commander and preserve logs before remediation.\n\nSection 4.3 · Recovery verification\nRecovery requires service health checks, an incident timeline and owner approval before closure.`;
  const architectureGuide = `Section 1 · System map\nThe product is a tenant-aware knowledge and readiness platform. The web application calls authenticated APIs that resolve organization, division and role before accessing stored knowledge.\n\nSection 2 · Local development\nInstall dependencies, configure environment variables, start the web server and run the verification suite before opening a pull request. Never commit credentials.\n\nSection 3 · Delivery standard\nEvery production change requires tests, peer review, security checks, observability and a rollback plan.`;
  const supportGuide = `Section 1 · Trusted answers\nSupport agents must answer from an approved, current source and include the relevant policy section when the request involves customer data.\n\nSection 2 · Escalation\nEscalate suspected privacy, security or contractual issues to the named owner. Do not guess when evidence is insufficient.`;
  const operationsGuide = `Section 1 · Daily controls\nOperations owners review exceptions, confirm handoffs and record material decisions in the audit trail.\n\nSection 2 · Change readiness\nMaterial SOP changes require owner approval, targeted learning and verification before the effective date.`;
  const legalGuide = `Section 1 · Policy lifecycle\nLegal owners draft, review, approve and publish controlled policies with effective dates and version history.\n\nSection 2 · Evidence\nEach material interpretation must retain its source, approver and affected audience for audit readiness.`;
  return {
    divisions: [
      { id: "div-engineering", organizationId: "org-alethia", name: "Engineering", slug: "engineering", description: "Build, ship and operate the product safely.", createdAt: new Date().toISOString() },
      { id: "div-legal", organizationId: "org-alethia", name: "Legal & Compliance", slug: "legal-compliance", description: "Own policy, regulatory evidence and governance.", createdAt: new Date().toISOString() },
      { id: "div-support", organizationId: "org-alethia", name: "Customer Support", slug: "customer-support", description: "Resolve customer needs with approved knowledge.", createdAt: new Date().toISOString() },
      { id: "div-operations", organizationId: "org-alethia", name: "Operations", slug: "operations", description: "Run reliable, repeatable business operations.", createdAt: new Date().toISOString() },
    ],
    clientAccounts: [
      { id: "ca-admin", organizationId: "org-alethia", divisionId: null, name: "Maya Putri", email: "admin@alethia.demo", passwordHash: hashPassword("Welcome123!"), accountRole: "org_admin", functionalRole: "manager", title: "Head of Knowledge Operations", status: "active", createdAt: new Date().toISOString() },
      { id: "ca-eng-manager", organizationId: "org-alethia", divisionId: "div-engineering", name: "Raka Wijaya", email: "engineering.manager@alethia.demo", passwordHash: hashPassword("Welcome123!"), accountRole: "manager", functionalRole: "manager", title: "Engineering Manager", status: "active", createdAt: new Date().toISOString() },
      { id: "ca-developer", organizationId: "org-alethia", divisionId: "div-engineering", name: "Dimas Nugroho", email: "developer@alethia.demo", passwordHash: hashPassword("Welcome123!"), accountRole: "member", functionalRole: "developer", title: "Senior Software Engineer", status: "active", createdAt: new Date().toISOString() },
    ],
    clientSessions: [],
    users: [
      {
        id: "u1",
        name: "Maya Putri",
        role: "manager",
        department: "Legal & Compliance",
        sensitiveAccess: true,
        verified: true,
      },
      {
        id: "u2",
        name: "Bima Saputra",
        role: "employee",
        department: "Customer Support",
        sensitiveAccess: true,
        verified: false,
      },
      {
        id: "u3",
        name: "Dimas Nugroho",
        role: "developer",
        department: "Engineering",
        sensitiveAccess: true,
        verified: false,
      },
      {
        id: "u4",
        name: "Laila Azzahra",
        role: "legal",
        department: "Legal & Compliance",
        sensitiveAccess: true,
        verified: true,
      },
      ...Array.from({ length: 36 }, (_, index) => {
        const number = index + 5;
        const gap = number <= 8;
        const departments = [
          "Customer Support",
          "Engineering",
          "Operations",
          "Legal & Compliance",
        ];
        return {
          id: `u${number}`,
          name: `Demo Employee ${String(number).padStart(2, "0")}`,
          role: "employee" as const,
          department: departments[index % departments.length],
          sensitiveAccess: gap,
          verified: !gap,
        };
      }),
    ],
    documents: [
      {
        id: "doc-policy-v3",
        title: "Customer Data Handling Policy",
        version: "v3.0",
        department: "Legal & Compliance",
        access: ["manager", "employee", "developer", "legal"],
        content,
        chunks: chunkDocument(content),
        createdAt: new Date().toISOString(),
      },
      {
        id: "doc-api-auth-v3",
        title: "API Authentication Standard",
        version: "v3.0",
        department: "Engineering",
        access: ["manager", "developer"],
        content: apiStandard,
        chunks: chunkDocument(apiStandard),
        createdAt: new Date().toISOString(),
      },
      {
        id: "doc-incident-v3",
        title: "Incident Response SOP",
        version: "v3.0",
        department: "Engineering",
        access: ["manager", "developer", "legal"],
        content: incidentRunbook,
        chunks: chunkDocument(incidentRunbook),
        createdAt: new Date().toISOString(),
      },
      { id: "doc-platform-architecture", title: "Platform Architecture & Developer Setup", version: "v2.1", department: "Engineering", access: ["manager", "developer"], content: architectureGuide, chunks: chunkDocument(architectureGuide), organizationId: "org-alethia", divisionId: "div-engineering", createdAt: new Date().toISOString() },
      { id: "doc-secure-delivery", title: "Secure Delivery & Pull Request Standard", version: "v1.4", department: "Engineering", access: ["manager", "developer"], content: apiStandard, chunks: chunkDocument(apiStandard), organizationId: "org-alethia", divisionId: "div-engineering", createdAt: new Date().toISOString() },
      { id: "doc-support-trusted-answers", title: "Customer Support Trusted Answer Playbook", version: "v3.2", department: "Customer Support", access: ["manager", "employee"], content: supportGuide, chunks: chunkDocument(supportGuide), organizationId: "org-alethia", divisionId: "div-support", createdAt: new Date().toISOString() },
      { id: "doc-operations-change", title: "Operations Change Readiness SOP", version: "v2.0", department: "Operations", access: ["manager", "employee"], content: operationsGuide, chunks: chunkDocument(operationsGuide), organizationId: "org-alethia", divisionId: "div-operations", createdAt: new Date().toISOString() },
      { id: "doc-legal-lifecycle", title: "Policy Lifecycle & Evidence Standard", version: "v4.0", department: "Legal & Compliance", access: ["manager", "legal"], content: legalGuide, chunks: chunkDocument(legalGuide), organizationId: "org-alethia", divisionId: "div-legal", createdAt: new Date().toISOString() },
    ],
    campaigns: [
      {
        id: "camp-seed",
        documentId: "doc-policy-v3",
        title: "Customer Data Policy v3.0",
        audience: 40,
        dueAt: "2026-08-20",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "camp-history-1",
        documentId: "doc-policy-v3",
        title: "Incident Response refresher",
        audience: 18,
        dueAt: "2026-08-14",
        status: "completed",
        createdAt: new Date().toISOString(),
      },
      {
        id: "camp-history-2",
        documentId: "doc-policy-v3",
        title: "Merchant Onboarding v2.0",
        audience: 24,
        dueAt: "2026-08-14",
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    ],
    risks: [
      {
        id: "risk-1",
        title: "Sensitive-data access remains unverified",
        severity: "critical",
        status: "open",
        documentId: "doc-policy-v3",
      },
      {
        id: "risk-2",
        title: "Customer Support Playbook is due for review",
        severity: "high",
        status: "open",
        documentId: "doc-policy-v3",
      },
      {
        id: "risk-3",
        title: "Incident Response verification requires retry",
        severity: "high",
        status: "open",
        documentId: "doc-policy-v3",
      },
      {
        id: "risk-4",
        title: "Merchant Onboarding coverage below target",
        severity: "medium",
        status: "open",
        documentId: "doc-policy-v3",
      },
      ...Array.from({ length: 18 }, (_, index) => ({
        id: `risk-history-${index + 1}`,
        title: `Resolved readiness finding ${index + 1}`,
        severity: "medium" as const,
        status: "resolved" as const,
        documentId: "doc-policy-v3",
      })),
    ],
    audit: [],
    agentTasks: [],
    verifications: [],
    documentAnalyses: [],
    knowledgeAssignments: [],
    notifications: [],
    impactEvidence: [],
    analytics: [],
    connectors: [],
    syncRuns: [],
    teams: [
      {
        id: "team-legal",
        name: "Legal & Compliance",
        department: "Legal & Compliance",
        managerId: "u1",
        memberIds: ["u1", "u4"],
      },
      {
        id: "team-support",
        name: "Customer Support",
        department: "Customer Support",
        managerId: "u1",
        memberIds: ["u2"],
      },
    ],
    sso: {
      enabled: false,
      provider: "oidc",
      issuer: "",
      clientId: "",
      allowedDomain: "alethia.id",
    },
    governance: {
      citationRequired: true,
      minConfidence: 0.7,
      humanApprovalForCritical: true,
      retentionDays: 365,
      allowedModels: ["alethia-grounded-v1"],
      allowedProviders: ["sumopod", "local"],
      blockBelowConfidence: true,
      crossDivisionIsolation: true,
      requirePromptAudit: true,
    },
    documentVersions: [],
    changeIntelligence: [],
    aiDecisionLogs: [],
    modelRegistry: [
      {
        id: "model-grounded-v1",
        provider: "local",
        model: "alethia-grounded",
        version: "1.0.0",
        status: "approved",
        evalScore: 100,
      },
    ],
    auditSchedules: [
      {
        id: "schedule-weekly",
        name: "Weekly knowledge health audit",
        cadence: "weekly",
        enabled: true,
        lastRunAt: null,
      },
    ],
    governanceFindings: [],
    departmentAgents: [
      {
        id: "agent-legal",
        name: "Legal readiness agent",
        department: "Legal & Compliance",
        enabled: true,
        actions: ["audit", "remind", "escalate"],
        escalationRole: "manager",
        lastRunAt: null,
      },
    ],
    evaluations: [],
    organizations: [
      {
        id: "org-alethia",
        name: "Alethia Company",
        slug: "alethia-company",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ],
    memberships: [
      {
        id: "membership-owner",
        organizationId: "org-alethia",
        userId: "u1",
        role: "owner",
      },
      {
        id: "membership-member",
        organizationId: "org-alethia",
        userId: "u2",
        role: "member",
      },
      {
        id: "membership-legal",
        organizationId: "org-alethia",
        userId: "u4",
        role: "admin",
      },
    ],
    subscriptions: [
      {
        organizationId: "org-alethia",
        plan: "enterprise",
        status: "trial",
        seats: 100,
        renewalAt: "2026-09-18",
      },
    ],
    usage: [
      {
        organizationId: "org-alethia",
        documents: 1,
        queries: 0,
        seats: 4,
        syncs: 0,
      },
    ],
    featureFlags: [
      {
        organizationId: "org-alethia",
        key: "continuous-audits",
        enabled: true,
      },
      {
        organizationId: "org-alethia",
        key: "department-agents",
        enabled: true,
      },
    ],
    workflowTemplates: [
      {
        id: "template-fintech",
        industry: "fintech",
        name: "Fintech compliance readiness",
        description:
          "Customer data, access control and incident-response verification.",
        documents: [
          "Customer Data Policy",
          "Access Control Standard",
          "Incident Response SOP",
        ],
        campaigns: ["Quarterly access verification"],
        agentActions: ["audit", "remind", "escalate"],
      },
      {
        id: "template-healthcare",
        industry: "healthcare",
        name: "Healthcare privacy readiness",
        description: "Patient privacy and clinical data handling workflows.",
        documents: ["Patient Privacy Policy", "Clinical Data SOP"],
        campaigns: ["Privacy verification"],
        agentActions: ["audit", "escalate"],
      },
      {
        id: "template-logistics",
        industry: "logistics",
        name: "Operations safety readiness",
        description: "Fleet, warehouse and incident SOP verification.",
        documents: ["Warehouse Safety SOP", "Fleet Incident SOP"],
        campaigns: ["Safety certification"],
        agentActions: ["remind", "escalate"],
      },
      {
        id: "template-saas",
        industry: "saas",
        name: "SaaS security readiness",
        description: "Secure development, deployment and incident knowledge.",
        documents: ["Secure SDLC", "Deployment SOP", "Security Incident SOP"],
        campaigns: ["Engineering security verification"],
        agentActions: ["audit", "remind"],
      },
    ],
  };
}

function normalizeDb(db: Database): Database {
  db.analytics ||= [];
  db.divisions ||= [];
  db.clientAccounts ||= [];
  db.clientSessions ||= [];
  if (!db.clientAccounts.length) {
    const tenantDefaults = seed();
    db.divisions = tenantDefaults.divisions;
    db.clientAccounts = tenantDefaults.clientAccounts;
  }
  if (!db.documents.some((item) => item.id === "doc-platform-architecture")) {
    const showcaseDefaults = seed();
    db.documents.push(...showcaseDefaults.documents.filter((item) => item.id.startsWith("doc-platform-") || item.id.startsWith("doc-secure-") || item.id.startsWith("doc-support-") || item.id.startsWith("doc-operations-") || item.id.startsWith("doc-legal-")));
  }
  db.audit ||= [];
  db.audit.forEach((event) => {
    event.organizationId ||= "org-alethia";
  });
  db.agentTasks ||= [];
  db.verifications ||= [];
  db.documentAnalyses ||= [];
  const approvedSeedDocumentIds = new Set([
    "doc-policy-v3",
    "doc-api-auth-v3",
    "doc-incident-v3",
    "doc-platform-architecture",
    "doc-secure-delivery",
    "doc-support-trusted-answers",
    "doc-operations-change",
    "doc-legal-lifecycle",
  ]);
  db.documents
    .filter(
      (document) =>
        approvedSeedDocumentIds.has(document.id) &&
        !db.documentAnalyses.some(
          (analysis) => analysis.documentId === document.id,
        ),
    )
    .forEach((document) => {
      db.documentAnalyses.push({
        documentId: document.id,
        summary: `Understand and apply ${document.title}.`,
        businessImpact:
          "Verified understanding reduces operational mistakes and creates auditable readiness evidence.",
        keyChanges: [
          "Use the current approved source",
          "Escalate when evidence is insufficient",
        ],
        affectedDepartments: [document.department],
        affectedRoles: document.access,
        provider: "Alethia showcase",
        model: "grounded-seed-v1",
        createdAt: document.createdAt,
        approvalStatus: "approved",
        approvedBy: "Maya Putri",
        approvedAt: document.createdAt,
        approvalComment: "Approved competition demo knowledge test.",
        questions: [
          {
            question: `Which source should guide work covered by ${document.title}?`,
            scenario: "You need to make a material decision.",
            options: [
              "The current approved document",
              "A colleague's memory",
              "An old message",
              "An unverified public answer",
            ],
            correctIndex: 0,
            explanation: "Use the current approved source.",
            citation: "Section 1",
          },
          {
            question:
              "What should you do when the available evidence is insufficient?",
            scenario: "The document does not support a confident answer.",
            options: [
              "Guess",
              "Escalate to the named owner",
              "Ignore the issue",
              "Use an outdated version",
            ],
            correctIndex: 1,
            explanation: "Escalation preserves accuracy and accountability.",
            citation: "Section 2",
          },
          {
            question: "Why is verification recorded?",
            scenario: "A material process has changed.",
            options: [
              "For decoration",
              "To replace the source",
              "To create readiness evidence",
              "To remove manager ownership",
            ],
            correctIndex: 2,
            explanation:
              "Verification turns distribution into measurable understanding.",
            citation: "Section 3",
          },
        ],
      });
    });
  db.documentAnalyses.forEach((analysis) => {
    if (!analysis.approvalStatus) {
      const wasPublished = db.campaigns.some(
        (campaign) => campaign.documentId === analysis.documentId,
      );
      analysis.approvalStatus = wasPublished ? "approved" : "pending_review";
      analysis.approvedBy = wasPublished ? "Maya Putri" : null;
      analysis.approvedAt = wasPublished ? analysis.createdAt : null;
      analysis.approvalComment = wasPublished
        ? "Migrated from an existing published campaign."
        : "";
    }
  });
  db.knowledgeAssignments ||= [];
  db.notifications ||= [];
  db.impactEvidence ||= [];
  db.connectors ||= [];
  db.connectors.forEach((connector) => {
    connector.schedule ||= "manual";
    connector.nextSyncAt ||= null;
  });
  db.syncRuns ||= [];
  db.syncRuns.forEach((run) => {
    run.updated ??= 0;
    run.unchanged ??= 0;
    run.changesCreated ??= 0;
  });
  db.teams ||= [];
  db.sso ||= {
    enabled: false,
    provider: "oidc",
    issuer: "",
    clientId: "",
    allowedDomain: "alethia.id",
  };
  db.governance ||= {
    citationRequired: true,
    minConfidence: 0.7,
    humanApprovalForCritical: true,
    retentionDays: 365,
    allowedModels: ["alethia-grounded-v1"],
    allowedProviders: ["sumopod", "local"],
    blockBelowConfidence: true,
    crossDivisionIsolation: true,
    requirePromptAudit: true,
  };
  db.governance.allowedProviders ||= ["sumopod", "local"];
  db.governance.blockBelowConfidence ??= true;
  db.governance.crossDivisionIsolation ??= true;
  db.governance.requirePromptAudit ??= true;
  db.documentVersions ||= [];
  db.changeIntelligence ||= [];
  db.aiDecisionLogs ||= [];
  db.modelRegistry ||= [];
  db.auditSchedules ||= [];
  db.governanceFindings ||= [];
  db.departmentAgents ||= [];
  db.evaluations ||= [];
  db.organizations ||= [];
  db.memberships ||= [];
  db.subscriptions ||= [];
  db.usage ||= [];
  db.featureFlags ||= [];
  db.workflowTemplates ||= [];
  return db;
}

// PostgreSQL / Supabase Direct Connection persistence adapter
async function getPostgresDb(): Promise<Database | null> {
  const connectionString =
    process.env.SUPABASE_DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL;
  if (!connectionString) return null;

  try {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS alethia_store (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const res = await pool.query(
      "SELECT data FROM alethia_store WHERE id = 'main'",
    );
    await pool.end();
    if (res.rows.length && res.rows[0].data) {
      const data = typeof res.rows[0].data === "string"
        ? JSON.parse(res.rows[0].data)
        : res.rows[0].data;
      return data as Database;
    }
  } catch (err) {
    console.error("PostgreSQL/Supabase DB read error:", err);
  }
  return null;
}

async function savePostgresDb(db: Database): Promise<boolean> {
  const connectionString =
    process.env.SUPABASE_DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL;
  if (!connectionString) return false;

  try {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS alethia_store (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(
      `INSERT INTO alethia_store (id, data, updated_at)
       VALUES ('main', $1, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
      [JSON.stringify(db)],
    );
    await pool.end();
    return true;
  } catch (err) {
    console.error("PostgreSQL/Supabase DB write error:", err);
    return false;
  }
}

// Supabase REST SDK Persistence Adapter
async function getSupabaseRestDb(): Promise<Database | null> {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("alethia_store")
      .select("data")
      .eq("id", "main")
      .maybeSingle();

    if (!error && data && data.data) {
      const dbData = typeof data.data === "string" ? JSON.parse(data.data) : data.data;
      return dbData as Database;
    }
  } catch (err) {
    console.error("Supabase REST read error:", err);
  }
  return null;
}

async function saveSupabaseRestDb(db: Database): Promise<boolean> {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) return false;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("alethia_store").upsert(
      {
        id: "main",
        data: db,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (!error) return true;
    console.error("Supabase REST write error:", error);
  } catch (err) {
    console.error("Supabase REST write error:", err);
  }
  return false;
}

// MongoDB persistence adapter
async function getMongoDb(): Promise<Database | null> {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUrl) return null;

  try {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const dbName = process.env.DB_NAME || "alethia";
    const collection = client.db(dbName).collection("alethia_store");
    const doc = await collection.findOne({ _id: "main" as any });
    await client.close();
    if (doc && doc.data) {
      return doc.data as Database;
    }
  } catch (err) {
    console.error("MongoDB read error:", err);
  }
  return null;
}

async function saveMongoDb(db: Database): Promise<boolean> {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUrl) return false;

  try {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const dbName = process.env.DB_NAME || "alethia";
    const collection = client.db(dbName).collection("alethia_store");
    await collection.updateOne(
      { _id: "main" as any },
      { $set: { data: db, updatedAt: new Date() } },
      { upsert: true },
    );
    await client.close();
    return true;
  } catch (err) {
    console.error("MongoDB write error:", err);
    return false;
  }
}

export async function readDb(): Promise<Database> {
  // 1. Supabase / PostgreSQL Direct Connection
  const pgDb = await getPostgresDb();
  if (pgDb) {
    globalThis._alethia_memory_db = normalizeDb(pgDb);
    return globalThis._alethia_memory_db;
  }

  // 2. Supabase REST API SDK
  const supaDb = await getSupabaseRestDb();
  if (supaDb) {
    globalThis._alethia_memory_db = normalizeDb(supaDb);
    return globalThis._alethia_memory_db;
  }

  // 3. MongoDB (MongoDB Atlas, Emergent Mongo, etc.)
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    globalThis._alethia_memory_db = normalizeDb(mongoDb);
    return globalThis._alethia_memory_db;
  }

  // 4. In-memory / File / Seed fallback
  if (globalThis._alethia_memory_db) {
    return globalThis._alethia_memory_db;
  }

  let db: Database;
  try {
    try {
      db = JSON.parse(await readFile(dataFile, "utf8")) as Database;
    } catch {
      db = JSON.parse(await readFile(tmpFile, "utf8")) as Database;
    }
  } catch {
    db = seed();
    await writeDb(db);
    return db;
  }

  db = normalizeDb(db);
  globalThis._alethia_memory_db = db;
  return db;
}

export async function writeDb(db: Database) {
  globalThis._alethia_memory_db = db;

  // 1. Supabase / PostgreSQL Direct Connection if configured
  if (await savePostgresDb(db)) {
    return;
  }

  // 2. Supabase REST API SDK if configured
  if (await saveSupabaseRestDb(db)) {
    return;
  }

  // 3. MongoDB if configured
  if (await saveMongoDb(db)) {
    return;
  }


  // 3. Fallback: Local file / /tmp
  const jsonContent = JSON.stringify(db, null, 2);
  try {
    await mkdir(dataDir, { recursive: true });
    const temp = `${dataFile}.tmp`;
    await writeFile(temp, jsonContent);
    await rename(temp, dataFile);
    return;
  } catch {}

  try {
    const temp = `${tmpFile}.tmp`;
    await writeFile(temp, jsonContent);
    await rename(temp, tmpFile);
  } catch {}
}

export async function mutateDb<T>(fn: (db: Database) => T | Promise<T>) {
  const db = await readDb();
  const result = await fn(db);
  await writeDb(db);
  return result;
}

export async function resetDb() {
  const db = seed();
  await writeDb(db);
  return db;
}

