"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Gauge,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Moon,
  MoreHorizontal,
  Network,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  UploadCloud,
  Users,
  X,
  Zap,
} from "lucide-react";

type Page =
  | "home"
  | "work"
  | "documents"
  | "changes"
  | "assistant"
  | "people"
  | "campaigns"
  | "risk"
  | "analytics"
  | "governance"
  | "enterprise"
  | "integrations"
  | "emergent"
  | "verify"
  | "settings";
type Role = "Manager" | "Employee" | "Developer" | "Legal";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const role = document.documentElement.dataset.role?.toLowerCase();
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(role ? { "x-demo-role": role } : {}),
      ...(init?.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

const docs = [
  {
    title: "Customer Data Handling Policy",
    category: "Compliance",
    owner: "Maya Putri",
    version: "v3.0",
    status: "Needs verification",
    review: "12 Sep 2026",
    affected: 40,
    risk: "Critical",
  },
  {
    title: "Incident Response SOP",
    category: "Engineering",
    owner: "Rizky Aditya",
    version: "v3.0",
    status: "Current",
    review: "20 Oct 2026",
    affected: 18,
    risk: "High",
  },
  {
    title: "Merchant Onboarding SOP",
    category: "Operations",
    owner: "Nadia Yusuf",
    version: "v2.0",
    status: "Current",
    review: "02 Nov 2026",
    affected: 24,
    risk: "Medium",
  },
  {
    title: "API Authentication Standard",
    category: "Engineering",
    owner: "Fajar Rahman",
    version: "v3.0",
    status: "Current",
    review: "18 Nov 2026",
    affected: 14,
    risk: "Medium",
  },
  {
    title: "Customer Support Playbook",
    category: "Support",
    owner: "Dewi Lestari",
    version: "v4.0",
    status: "Needs review",
    review: "28 Aug 2026",
    affected: 31,
    risk: "High",
  },
  {
    title: "Employee Handbook",
    category: "People",
    owner: "Sari Wibowo",
    version: "v5.0",
    status: "Current",
    review: "10 Jan 2027",
    affected: 96,
    risk: "Low",
  },
];

const workItems = [
  {
    title: "Verify Customer Data Handling Policy v3.0",
    type: "Verification",
    due: "Today",
    status: "Overdue",
    icon: ShieldAlert,
  },
  {
    title: "Review 7 material policy changes",
    type: "Learning · 8 min",
    due: "Today",
    status: "In progress",
    icon: BookOpen,
  },
  {
    title: "Complete Incident Response refresher",
    type: "Learning · 12 min",
    due: "Tomorrow",
    status: "Assigned",
    icon: GraduationCap,
  },
  {
    title: "Confirm Merchant Onboarding SOP v2.0",
    type: "Verification",
    due: "22 Aug",
    status: "Assigned",
    icon: FileCheck2,
  },
];

const developerWorkItems = [
  {
    title: "Verify Customer Data Handling Policy v3.0",
    type: "Verification · privileged API access",
    due: "Today",
    status: "Overdue",
    icon: ShieldAlert,
  },
  {
    title: "Review API Authentication Standard v3.0",
    type: "Technical learning · 10 min",
    due: "Today",
    status: "In progress",
    icon: FileText,
  },
  {
    title: "Complete Incident Response runbook refresher",
    type: "Engineering learning · 12 min",
    due: "Tomorrow",
    status: "Assigned",
    icon: GraduationCap,
  },
  {
    title: "Confirm Secure SDLC deployment controls",
    type: "Technical verification",
    due: "22 Aug",
    status: "Assigned",
    icon: FileCheck2,
  },
];

const risks = [
  {
    title: "6 employees with sensitive-data access remain unverified",
    detail: "Customer Data Handling Policy v3.0 · Legal & Compliance",
    severity: "Critical",
    owner: "Maya Putri",
  },
  {
    title: "Customer Support Playbook is due for review",
    detail: "Owner review is due in 10 days · Customer Support",
    severity: "High",
    owner: "Dewi Lestari",
  },
  {
    title: "4 failed Incident Response verification",
    detail: "Engineering · retry learning recommended",
    severity: "High",
    owner: "Rizky Aditya",
  },
  {
    title: "Merchant Onboarding coverage below target",
    detail: "78% verified against 90% target · Operations",
    severity: "Medium",
    owner: "Nadia Yusuf",
  },
];

const nav: {
  label: string;
  items: { page: Page; label: string; icon: typeof Home; count?: number }[];
}[] = [
  {
    label: "Workspace",
    items: [
      { page: "home", label: "Home", icon: Home },
      { page: "work", label: "My work", icon: BriefcaseBusiness, count: 4 },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { page: "documents", label: "Documents", icon: FileText, count: 6 },
      { page: "changes", label: "Changes", icon: Activity, count: 7 },
      { page: "assistant", label: "Assistant", icon: MessageSquareText },
    ],
  },
  {
    label: "Readiness",
    items: [
      { page: "people", label: "People", icon: Users },
      { page: "campaigns", label: "Campaigns", icon: Target, count: 3 },
      { page: "risk", label: "Risk", icon: ShieldAlert, count: 4 },
      { page: "analytics", label: "Analytics", icon: Gauge },
    ],
  },
  {
    label: "Governance",
    items: [
      { page: "governance", label: "AI governance", icon: ShieldAlert },
      {
        page: "enterprise",
        label: "Enterprise admin",
        icon: BriefcaseBusiness,
      },
      { page: "integrations", label: "Integrations", icon: Network },
      { page: "emergent", label: "Built with Emergent", icon: Sparkles },
    ],
  },
];

const formatWorkspaceDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const pagesForRole = (role: Role) =>
  new Set<Page>(
    role === "Employee"
      ? ["home", "work", "documents", "assistant", "verify", "settings"]
      : role === "Developer"
        ? [
            "home",
            "work",
            "documents",
            "changes",
            "assistant",
            "risk",
            "verify",
            "settings",
          ]
        : role === "Legal"
          ? [
              "home",
              "work",
              "documents",
              "changes",
              "assistant",
              "campaigns",
              "risk",
              "analytics",
              "governance",
              "emergent",
              "settings",
            ]
          : [
              "home",
              "work",
              "documents",
              "changes",
              "assistant",
              "people",
              "campaigns",
              "risk",
              "analytics",
              "governance",
              "enterprise",
              "integrations",
              "emergent",
              "verify",
              "settings",
            ],
  );

const pageMeta: Record<Page, [string, string, string]> = {
  home: [
    "Overview",
    "Good morning, Maya",
    "Here’s what needs attention across Alethia today.",
  ],
  work: [
    "My work",
    "Your work queue",
    "Learning, verification and follow-up tasks in one focused view.",
  ],
  documents: [
    "Knowledge",
    "Documents",
    "Trusted company knowledge, ownership and version readiness.",
  ],
  changes: [
    "Knowledge",
    "Impact analysis",
    "See exactly how a policy change becomes measurable organizational action.",
  ],
  assistant: [
    "Knowledge",
    "Alethia Assistant",
    "Ask trusted company knowledge and inspect every source.",
  ],
  people: [
    "Readiness",
    "People readiness",
    "Understand verification coverage and knowledge gaps by person.",
  ],
  campaigns: [
    "Readiness",
    "Verification campaigns",
    "Coordinate policy learning, verification and escalation.",
  ],
  risk: [
    "Readiness",
    "Knowledge risk",
    "Prioritized readiness gaps with owners and recommended actions.",
  ],
  analytics: [
    "Readiness",
    "Advanced analytics",
    "Compare readiness and connected knowledge across the organization.",
  ],
  integrations: [
    "Workspace",
    "Integrations",
    "Connect company knowledge sources and monitor synchronization.",
  ],
  governance: [
    "Governance",
    "AI governance",
    "Control models, evidence requirements and continuous knowledge audits.",
  ],
  enterprise: [
    "Enterprise",
    "Enterprise administration",
    "Manage tenant security, subscription capacity and industry workflows.",
  ],
  emergent: [
    "Competition",
    "Built with Emergent",
    "How the platform accelerated a governed, end-to-end product—not just a prototype.",
  ],
  verify: [
    "My work",
    "Knowledge verification",
    "Complete a source-backed scenario assessment.",
  ],
  settings: [
    "Workspace",
    "Settings",
    "Manage appearance, notifications and workspace preferences.",
  ],
};

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "critical" | "brand" | "neutral";
}) {
  return <span className={`chip ${tone}`}>{children}</span>;
}

function Header({
  page,
  onCampaign,
  onTour,
  canManage,
  personaName,
  role,
  clientMode,
}: {
  page: Page;
  onCampaign: () => void;
  onTour: () => void;
  canManage: boolean;
  personaName: string;
  role: Role;
  clientMode: boolean;
}) {
  const [, defaultTitle, description] = pageMeta[page];
  const title =
    page === "home"
      ? `Good morning, ${personaName.split(" ")[0]}`
      : defaultTitle;
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{pageMeta[page][0]}</div>
        <h1>{title}</h1>
        <p>
          {page === "home" && role === "Employee"
            ? "Your assigned knowledge, verification progress and next action."
            : page === "home" && clientMode
              ? "Your readiness baseline, current work and next setup action."
            : description}
        </p>
      </div>
      <div className="actions">
        <button className="btn" onClick={onTour}>
          <CircleHelp /> Guided tour
        </button>
        {canManage &&
          (page === "home" || page === "changes" || page === "campaigns") && (
            <button className="btn primary" onClick={onCampaign}>
              <Plus /> Start campaign
            </button>
          )}
      </div>
    </div>
  );
}

function Metrics() {
  const [data, setData] = useState<{
    health: number;
    verificationCoverage: number;
    overdueWork: number;
    openRisks: number;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api<typeof data>("/api/health")
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Health metrics could not be loaded.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  if (error)
    return (
      <div className="inline-error" role="alert">
        {error}
      </div>
    );
  if (!data)
    return (
      <div className="grid metrics" aria-label="Loading readiness metrics">
        {[1, 2, 3, 4].map((item) => (
          <div className="card metric skeleton" key={item} />
        ))}
      </div>
    );
  const values = [
    [
      "Alethia Health",
      String(data.health),
      "Current readiness score",
      Gauge,
      `${data.health}%`,
      "",
    ],
    [
      "Verification coverage",
      `${data.verificationCoverage}%`,
      "Verified employees",
      FileCheck2,
      `${data.verificationCoverage}%`,
      "",
    ],
    [
      "Overdue work",
      String(data.overdueWork),
      "Sensitive-access gaps",
      Clock3,
      `${Math.min(100, data.overdueWork * 20)}%`,
      "warn",
    ],
    [
      "Open knowledge risks",
      String(data.openRisks),
      "Requires an owner action",
      ShieldAlert,
      `${Math.min(100, data.openRisks * 25)}%`,
      "warn",
    ],
  ] as const;
  return (
    <div className="grid metrics">
      {values.map(([label, value, trend, Icon, width, cls]) => (
        <div className="card metric" key={label}>
          <div className="metric-top">
            <span>{label}</span>
            <span className="metric-icon">
              <Icon />
            </span>
          </div>
          <div className="metric-value">{value}</div>
          <div className={`trend ${cls}`}>
            <ArrowRight /> {trend}
          </div>
          <div className="progress">
            <span style={{ width }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PersonalMetrics({ realOnly = false }: { realOnly?: boolean }) {
  const [assignments, setAssignments] = useState<
    { status: string; score?: number; analysis?: { questions?: unknown[] } }[]
  >([]);
  useEffect(() => {
    void api<{ assignments: { status: string; score?: number; analysis?: { questions?: unknown[] } }[] }>(
      "/api/assignments",
    )
      .then((result) => setAssignments(result.assignments))
      .catch(() => undefined);
  }, []);
  const actionable = assignments.filter((assignment) =>
    Boolean(assignment.analysis?.questions?.length),
  );
  const total = actionable.length || (realOnly ? 0 : 4);
  const completed = actionable.filter(
    (assignment) => assignment.status === "completed",
  ).length;
  const pending = Math.max(0, total - completed);
  const scored = actionable.filter(
    (assignment) => typeof assignment.score === "number",
  );
  const average = scored.length
    ? Math.round(
        scored.reduce((sum, assignment) => sum + (assignment.score || 0), 0) /
          scored.length,
      )
    : 0;
  const completion = total ? Math.round((completed / total) * 100) : 0;
  const values = [
    ["My readiness", `${completion}%`, "Personal completion", Gauge, `${completion}%`],
    ["Assigned knowledge", String(total), "Required for my role", FileText, "100%"],
    ["To complete", String(pending), "My remaining actions", Clock3, `${Math.min(100, pending * 25)}%`],
    ["Average score", scored.length ? `${average}%` : "—", "My verification results", FileCheck2, `${average}%`],
  ] as const;
  return (
    <div className="grid metrics" aria-label="Personal readiness metrics">
      {values.map(([label, value, trend, Icon, width]) => (
        <div className="card metric" key={label}>
          <div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon /></span></div>
          <div className="metric-value">{value}</div>
          <div className="trend"><ArrowRight /> {trend}</div>
          <div className="progress"><span style={{ width }} /></div>
        </div>
      ))}
    </div>
  );
}

function WorkList({
  onVerify,
  role,
  realOnly = false,
}: {
  onVerify: (assignmentId?: string) => void;
  role: Role;
  realOnly?: boolean;
}) {
  const [assignments, setAssignments] = useState<
    {
      id: string;
      status: string;
      dueAt: string;
      document?: { title: string; version: string };
      analysis?: { questions?: unknown[] };
    }[]
  >([]);
  useEffect(() => {
    void api<{ assignments: typeof assignments }>("/api/assignments")
      .then((result) => setAssignments(result.assignments))
      .catch(() => undefined);
  }, []);
  const items = role === "Developer" ? developerWorkItems : workItems;
  const actionableAssignments = assignments.filter(
    (item) =>
      item.status !== "completed" && Boolean(item.analysis?.questions?.length),
  );
  const visibleShowcaseItems =
    realOnly || (role === "Employee" && actionableAssignments.length)
      ? []
      : items;
  if (!actionableAssignments.length && !visibleShowcaseItems.length)
    return (
      <div className="empty-state compact-empty">
        <CheckCircle2 />
        <h3>You’re all caught up</h3>
        <p>New learning and verification assignments will appear here.</p>
      </div>
    );
  return (
    <div className="task-list">
      {actionableAssignments.map((item) => (
          <div
            className="task actionable"
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => onVerify(item.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onVerify(item.id);
            }}
          >
            <span className="task-icon">
              <Sparkles />
            </span>
            <div>
              <b>{item.document?.title || "AI knowledge verification"}</b>
              <small>
                AI-generated verification · {item.document?.version}
              </small>
            </div>
            <div className="task-right">
              <Chip tone={item.status === "failed" ? "critical" : "brand"}>
                {item.status}
              </Chip>
              <time>Due {formatWorkspaceDate(item.dueAt)}</time>
            </div>
          </div>
        ))}
      {visibleShowcaseItems.map((item, index) => {
        const Icon = item.icon;
        const actionable = index === 0;
        return (
          <div
            className={`task ${actionable ? "actionable" : ""}`}
            key={item.title}
            onClick={actionable ? () => onVerify() : undefined}
            tabIndex={actionable ? 0 : undefined}
            role={actionable ? "button" : undefined}
            onKeyDown={
              actionable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onVerify();
                    }
                  }
                : undefined
            }
          >
            <span className="task-icon">
              <Icon />
            </span>
            <div>
              <b>{item.title}</b>
              <small>{item.type}</small>
            </div>
            <div className="task-right">
              <Chip
                tone={
                  item.status === "Overdue"
                    ? "critical"
                    : item.status === "In progress"
                      ? "brand"
                      : "neutral"
                }
              >
                {item.status}
              </Chip>
              <time>{item.due}</time>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HomePage({
  setPage,
  role,
  onVerify,
  clientMode,
}: {
  setPage: (p: Page) => void;
  role: Role;
  onVerify: (assignmentId?: string) => void;
  clientMode?: boolean;
}) {
  const [divisionReadiness,setDivisionReadiness]=useState<{name:string;coverage:number}[]>([]);
  useEffect(()=>{api<{divisions?:{name:string;coverage:number}[]}>("/api/health").then((result)=>setDivisionReadiness(result.divisions||[])).catch(()=>undefined);},[]);
  if (role === "Employee") {
    return (
      <>
        <PersonalMetrics realOnly={clientMode} />
        <div className="grid main-grid">
          <section className="card">
            <div className="card-head">
              <div><h2>My work</h2><p>Only the knowledge assigned to you</p></div>
              <button className="text-action" onClick={() => setPage("work")}>View all</button>
            </div>
            <WorkList onVerify={onVerify} role={role} realOnly={clientMode} />
          </section>
          <section className="card">
            <div className="card-head">
              <div><h2>Your next best action</h2><p>Grounded in your role and assignments</p></div>
              <Sparkles size={15} color="var(--brand)" />
            </div>
            <div className="card-body">
              <div className="insight">
                <div className="insight-top"><Sparkles size={13} /> Personal guidance</div>
                <p>Complete your highest-priority verification to keep your role knowledge current.</p>
                <small>Only your assignments and approved sources are used.</small>
                <button className="btn primary" style={{ marginTop: 13 }} onClick={() => setPage("work")}>Open my work <ArrowRight /></button>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }
  return (
    <>
      <Metrics />
      <div className="grid main-grid">
        <div className="grid">
          <section className="card">
            <div className="card-head">
              <div>
                <h2>My work</h2>
                <p>Prioritized by urgency and access risk</p>
              </div>
              <button className="text-action" onClick={() => setPage("work")}>
                View all
              </button>
            </div>
            <WorkList onVerify={onVerify} role={role} realOnly={clientMode} />
          </section>
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Readiness by division</h2>
                <p>Verification coverage for required knowledge</p>
              </div>
              {role !== "Developer" && (
                <button
                  className="icon-btn"
                  aria-label="Open readiness analytics"
                  onClick={() => setPage("analytics")}
                >
                  <MoreHorizontal />
                </button>
              )}
            </div>
            <div className="card-body bar-list">
              {(divisionReadiness.length ? divisionReadiness.map((item) => [item.name, `${item.coverage}%`]) : (clientMode ? [
                ["Engineering", "0%"], ["Legal & Compliance", "0%"], ["Customer Support", "0%"], ["Operations", "0%"]
              ] : [
                ["Engineering", "92%"], ["Legal & Compliance", "88%"], ["Operations", "78%"], ["Customer Support", "64%"]
              ])).map(([name, value]) => (
                <div key={name}>
                  <div className="bar-label">
                    <span>{name}</span>
                    <b>{value}</b>
                  </div>
                  <div className="progress">
                    <span style={{ width: value }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="grid" style={{ alignContent: "start" }}>
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Alethia insight</h2>
                <p>Source-backed operational intelligence</p>
              </div>
              <Sparkles size={15} color="var(--brand)" />
            </div>
            <div className="card-body">
              <div className="insight">
                <div className="insight-top">
                  <Sparkles size={13} /> Highest impact opportunity
                </div>
                <p>
                  {role === "Developer"
                    ? "Reviewing the API Authentication Standard and completing the Incident Response refresher will close the highest-priority Engineering readiness gaps."
                    : clientMode ? "Start with the lowest-coverage division: assign an approved source, verify understanding and track the resulting readiness evidence." : "Verifying six employees with sensitive-data access will resolve the largest active readiness risk and increase Alethia Health by an estimated 4 points."}
                </p>
                <small>
                  {role === "Developer"
                    ? "Based on API Authentication Standard v3.0 and Incident Response SOP v3.0"
                    : clientMode ? "Based on your tenant-scoped documents, assignments and verification results" : "Based on Customer Data Handling Policy v3.0 · Section 4.2"}
                </small>
                <button
                  className="btn primary"
                  style={{ marginTop: 13 }}
                  onClick={() => setPage("changes")}
                >
                  Review impact <ArrowRight />
                </button>
              </div>
            </div>
          </section>
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Agent activity</h2>
                <p>Auditable automation events</p>
              </div>
              {role !== "Developer" && (
                <button
                  className="text-action"
                  onClick={() => setPage("governance")}
                >
                  Audit log
                </button>
              )}
            </div>
            <div className="card-body timeline">
              {(clientMode ? [
                ["Workspace knowledge indexed", "Approved company and division sources are available", Sparkles],
                ["Roles and divisions mapped", "Access follows organization and division scope", Users],
                ["Readiness workflow active", "Campaigns create personal, auditable assignments", Zap],
                ["Evidence trail ready", "Results update person and division readiness", Send],
              ] : [
                [
                  "Policy v3.0 analyzed",
                  "7 material changes detected · 8 min ago",
                  Sparkles,
                ],
                [
                  "40 employees mapped",
                  "6 high-risk access gaps found · 8 min ago",
                  Users,
                ],
                [
                  "Reminder sequence scheduled",
                  "Escalates overdue items in 48 hours · 5 min ago",
                  Zap,
                ],
                [
                  "Manager summary delivered",
                  "Sent to Legal & Operations owners · 2 min ago",
                  Send,
                ],
              ]).map(([title, meta, I]) => {
                const Icon = I as typeof Sparkles;
                return (
                  <div className="timeline-item" key={title as string}>
                    <span className="timeline-dot">
                      <Icon />
                    </span>
                    <div>
                      <b>{title as string}</b>
                      <span>{meta as string}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function DocumentsPage({
  onSelect,
  role,
  onUpload,
}: {
  onSelect: (d: (typeof docs)[number]) => void;
  role: Role;
  onUpload?: () => void;
}) {
  const [filter, setFilter] = useState("");
  const [view, setView] = useState("All documents");
  const [category, setCategory] = useState("All departments");
  const [showFilters, setShowFilters] = useState(false);
  const [persistedDocs, setPersistedDocs] = useState<(typeof docs)[number][]>(
    [],
  );
  useEffect(() => {
    const load = () =>
      void api<{
        documents: {
          id: string;
          title: string;
          department: string;
          version: string;
          createdAt: string;
        }[];
      }>("/api/documents")
        .then((result) =>
          setPersistedDocs(
            result.documents
              .filter(
                (document) =>
                  !docs.some((seed) => seed.title === document.title),
              )
              .map((document) => ({
                title: document.title,
                category: document.department,
                owner: "Maya Putri",
                version: document.version,
                status: "Current",
                review: formatWorkspaceDate(document.createdAt),
                affected: 0,
                risk: "Medium",
              })),
          ),
        )
        .catch(() => undefined);
    load();
    window.addEventListener("document-uploaded", load);
    return () => window.removeEventListener("document-uploaded", load);
  }, []);
  const staticRoleDocs =
    role === "Manager"
      ? docs
      : role === "Developer"
        ? docs.filter((document) => ["Engineering", "Compliance"].includes(document.category))
        : role === "Employee"
          ? docs.filter((document) => document.category !== "Engineering")
          : docs.filter((document) => document.title !== "API Authentication Standard");
  // Persisted documents are already permission- and division-filtered by the
  // API, so category heuristics must not hide company-wide tenant knowledge.
  const availableDocs = [...staticRoleDocs, ...persistedDocs];
  const filtered = availableDocs.filter(
    (d) =>
      d.title.toLowerCase().includes(filter.toLowerCase()) &&
      (category === "All departments" || d.category === category) &&
      (view === "All documents" ||
        (view === "Needs review" && d.status.includes("review")) ||
        (view === "Recently changed" && ["v3.0", "v4.0"].includes(d.version)) ||
        (view === "High impact" && ["Critical", "High"].includes(d.risk))),
  );
  const views = [
    "All documents",
    "Needs review",
    "Recently changed",
    "High impact",
  ];
  return (
    <>
      <div className="toolbar">
        <div className="segmented" aria-label="Saved document views">
          {views.map((item) => (
            <button
              key={item}
              className={view === item ? "active" : ""}
              onClick={() => setView(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <input
          className="filter-input"
          aria-label="Filter documents"
          placeholder="Filter documents…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className={`btn ${showFilters ? "selected-control" : ""}`}
          aria-expanded={showFilters}
          onClick={() => setShowFilters((value) => !value)}
        >
          <Filter /> Filters
        </button>
        {role === "Manager" && onUpload && (
          <button className="btn primary" onClick={onUpload}>
            <UploadCloud /> Upload and assign
          </button>
        )}
      </div>
      {showFilters && (
        <div className="filter-panel">
          <label>
            Department
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All departments</option>
              {[...new Set(availableDocs.map((d) => d.category))].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </label>
          <button
            className="text-action"
            onClick={() => {
              setCategory("All departments");
              setFilter("");
              setView("All documents");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <section className="card table-wrap">
        {filtered.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Document</th>
                <th scope="col">Owner</th>
                <th scope="col">Version</th>
                <th scope="col">Status</th>
                <th scope="col">Review date</th>
                <th scope="col">Affected</th>
                <th scope="col">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.title}
                  onClick={() => onSelect(d)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(d);
                    }
                  }}
                >
                  <td>
                    <div className="doc-title">
                      <span className="doc-icon">
                        <FileText />
                      </span>
                      <div>
                        <b>{d.title}</b>
                        <span>{d.category}</span>
                      </div>
                    </div>
                  </td>
                  <td>{d.owner}</td>
                  <td>
                    <b>{d.version}</b>
                  </td>
                  <td>
                    <Chip tone={d.status === "Current" ? "success" : "warning"}>
                      {d.status}
                    </Chip>
                  </td>
                  <td>{d.review}</td>
                  <td>{d.affected} people</td>
                  <td>
                    <Chip
                      tone={
                        d.risk === "Critical"
                          ? "critical"
                          : d.risk === "High"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {d.risk}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Search />
            <h2>No documents match</h2>
            <p>Clear or change the active filters.</p>
          </div>
        )}
      </section>
    </>
  );
}

function ImpactPage({ onCampaign, canManage }: { onCampaign: () => void; canManage: boolean }) {
  const [syncedChanges,setSyncedChanges]=useState<{id:string;documentId:string;fromVersion:string;toVersion:string;summary:string;severity:string;affectedUserIds:string[];status:string;added:string[]}[]>([]);
  useEffect(()=>{void api<{changes:typeof syncedChanges}>("/api/change-intelligence").then(result=>setSyncedChanges(result.changes)).catch(()=>undefined);},[]);
  return (
    <>
    {syncedChanges.length>0&&<section className="card" style={{marginBottom:14}}><div className="card-head"><div><h2>Connected-source change intelligence</h2><p>Material changes detected automatically during synchronization</p></div><Chip tone="brand">{syncedChanges.length} reviews</Chip></div><div className="card-body grid">{syncedChanges.slice(0,4).map(change=><div className="insight" key={change.id}><div className="insight-top"><Sparkles size={13}/>{change.fromVersion} → {change.toVersion} · {change.severity}</div><p>{change.summary}</p><small>{change.affectedUserIds.length} people affected · {change.added.length} additions</small>{canManage?<button className="btn primary" disabled={change.status==="campaign-created"} onClick={async()=>{await api("/api/change-intelligence",{method:"PUT",body:JSON.stringify({id:change.id,action:"launch-reverification"})});setSyncedChanges(items=>items.map(item=>item.id===change.id?{...item,status:"campaign-created"}:item));}}>{change.status==="campaign-created"?"Re-verification launched":"Approve & re-verify"}<ArrowRight/></button>:<Chip tone="neutral">Manager review required</Chip>}</div>)}</div></section>}
    <section className="card impact-hero">
      <div className="change-pane">
        <Chip tone="critical">7 meaningful changes</Chip>
        <h2 style={{ marginTop: 12 }}>Customer Data Handling Policy</h2>
        <p>v2.0 → v3.0 · analyzed 18 Aug 2026 at 09:42</p>
        {[
          [
            "4.2 · Privileged data access",
            "Critical",
            "Access review required every 12 months.",
            "Access review required every 90 days for roles handling customer PII.",
          ],
          [
            "6.1 · Incident notification",
            "High",
            "Report suspected exposure to the team lead.",
            "Report suspected exposure to Security and Legal within 30 minutes.",
          ],
          [
            "8.4 · Third-party exports",
            "Medium",
            "Manager approval is required.",
            "Manager and Data Protection approval are required with an audit record.",
          ],
        ].map(([section, severity, before, after]) => (
          <div className="change-item" key={section}>
            <div className="change-item-head">
              <b>{section}</b>
              <Chip
                tone={
                  severity === "Critical"
                    ? "critical"
                    : severity === "High"
                      ? "warning"
                      : "neutral"
                }
              >
                {severity}
              </Chip>
            </div>
            <div className="diff">
              <div>
                <strong>Previous</strong>
                {before}
              </div>
              <div>
                <strong>Current</strong>
                {after}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="audience-pane">
        <Chip tone="brand">Impact mapped</Chip>
        <div className="impact-number" style={{ marginTop: 14 }}>
          40
        </div>
        <p>
          employees affected across four divisions, including six people with
          sensitive-data access who remain unverified.
        </p>
        <div className="bar-list">
          {[
            ["Customer Support", "14", "35%"],
            ["Engineering", "11", "28%"],
            ["Operations", "9", "22%"],
            ["Legal & Compliance", "6", "15%"],
          ].map(([label, count, width]) => (
            <div key={label}>
              <div className="bar-label">
                <span>{label}</span>
                <b>{count} people</b>
              </div>
              <div className="progress">
                <span style={{ width }} />
              </div>
            </div>
          ))}
        </div>
        <div className="insight">
          <div className="insight-top">
            <AlertTriangle size={13} /> 6 high-risk gaps
          </div>
          <p>
            These employees can access customer PII but have not verified the
            new 90-day review requirement.
          </p>
          <small>Evidence: Section 4.2 · Access control changes</small>
        </div>
        {canManage && <div className="sticky-action">
          <button className="btn primary" onClick={onCampaign}>
            <Target /> Start verification campaign
          </button>
        </div>}
      </div>
    </section>
    </>
  );
}

type AssistantCitation = {
  documentId: string;
  title: string;
  version: string;
  section: string;
  excerpt: string;
  score: number;
};
type AssistantTurn = {
  query: string;
  answer: string;
  citations: AssistantCitation[];
  confidence: "high" | "moderate" | "insufficient";
};

function AssistantPage() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<AssistantTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const examples = [
    "When must customer PII access be reviewed?",
    "Who must be notified after customer-data exposure?",
    "What is the office parking policy?",
  ];
  const ask = async (query: string) => {
    const clean = query.trim();
    if (!clean || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await api<Omit<AssistantTurn, "query">>("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ query: clean }),
      });
      setTurns((items) => [...items, { query: clean, ...result }]);
      setInput("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Alethia could not answer. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="card assistant">
      <aside className="assistant-history">
        <button
          className="btn primary"
          style={{ width: "100%", marginBottom: 12 }}
          onClick={() => {
            setTurns([]);
            setInput("");
            setError("");
          }}
        >
          <Plus /> New conversation
        </button>
        <div className="nav-label">Suggested questions</div>
        {examples.map((x) => (
          <button className="history-item" key={x} onClick={() => ask(x)}>
            {x}
          </button>
        ))}
      </aside>
      <div className="chat">
        <div className="messages" aria-live="polite">
          {turns.length === 0 && (
            <div className="assistant-empty">
              <Sparkles />
              <h2>Ask approved company knowledge</h2>
              <p>
                Answers are permission-aware and always include confidence and
                source evidence.
              </p>
            </div>
          )}
          {turns.map((turn, index) => (
            <div key={`${turn.query}-${index}`}>
              <div className="message user">
                <div className="bubble">{turn.query}</div>
              </div>
              <div className="message">
                <div className="bubble">{turn.answer}</div>
                <div style={{ marginTop: 7 }}>
                  <Chip
                    tone={
                      turn.confidence === "high"
                        ? "success"
                        : turn.confidence === "moderate"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {turn.confidence} confidence
                  </Chip>
                </div>
              </div>
              {turn.citations.map((citation) => (
                <div
                  className="citation"
                  key={`${citation.documentId}-${citation.section}`}
                >
                  <span className="doc-icon">
                    <FileText />
                  </span>
                  <div>
                    <b>
                      {citation.title} {citation.version} · {citation.section}
                    </b>
                    <span>{citation.excerpt}</span>
                  </div>
                  <ChevronRight size={14} style={{ marginLeft: "auto" }} />
                </div>
              ))}
            </div>
          ))}
          {loading && (
            <div className="inline-state">
              <RefreshCw className="spin" /> Searching approved sources…
            </div>
          )}
          {error && (
            <div className="inline-error" role="alert">
              {error}
            </div>
          )}
        </div>
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
        >
          <input
            aria-label="Ask Alethia"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask trusted company knowledge…"
          />
          <button
            className="btn primary"
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send question"
          >
            <Send />
          </button>
        </form>
      </div>
    </section>
  );
}

function PeoplePage() {
  type Person = {id:string;name:string;email:string;division:string;title:string;accountRole:string;functionalRole:string;readiness:number;status:string};
  const [items,setItems]=useState<Person[]>([]); const [selected,setSelected]=useState<Person|null>(null); const [loading,setLoading]=useState(true); const [loadError,setLoadError]=useState("");
  useEffect(()=>{api<{people:Person[]}>("/api/client/people").then(result=>setItems(result.people)).catch((cause)=>setLoadError(cause instanceof Error?cause.message:"People could not be loaded.")).finally(()=>setLoading(false))},[]);
  if(loading)return <div className="inline-state"><RefreshCw className="spin"/> Loading people…</div>;
  if(loadError)return <div className="inline-error" role="alert">{loadError}</div>;
  return (
    <>
      <section className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Division</th>
              <th scope="col">Readiness</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((person) => {
              const {name, division:dept, readiness:score, status} = person;
              return (
                <tr key={person.id}>
                  <td>
                    <div className="doc-title">
                      <span className="avatar">
                        {name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div>
                        <b>{name}</b>
                        <span>
                          {person.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{dept}</td>
                  <td>
                    <b>{score}%</b>
                  </td>
                  <td>
                    <Chip
                      tone={
                        status === "Verified"
                          ? "success"
                          : status === "Overdue" || status === "At risk"
                            ? "critical"
                            : "brand"
                      }
                    >
                      {status}
                    </Chip>
                  </td>
                  <td>
                    <button
                      className="btn ghost"
                      onClick={() => setSelected(person)}
                    >
                      View profile <ChevronRight />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
          >
            <div className="modal-head">
              <div>
                <Chip tone={selected.status === "Verified" ? "success" : "warning"}>
                  {selected.status}
                </Chip>
                <h2 id="profile-title" style={{ marginTop: 9 }}>
                  {selected.name}
                </h2>
              </div>
              <button
                className="icon-btn"
                aria-label="Close profile"
                autoFocus
                onClick={() => setSelected(null)}
              >
                <X />
              </button>
            </div>
            <div className="modal-body">
              <div className="kv">
                <span>Division</span>
                <b>{selected.division}</b>
              </div>
              <div className="kv">
                <span>Readiness</span>
                <b>{selected.readiness}%</b>
              </div>
              <div className="kv">
                <span>Next action</span>
                <b>
                  {selected.status === "Verified"
                    ? "Maintain current knowledge"
                    : "Complete assigned verification"}
                </b>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CampaignsPage({ onCampaign }: { onCampaign: () => void }) {
  const [items, setItems] = useState<
    {
      id: string;
      title: string;
      audience: number;
      dueAt: string;
      status: "active" | "completed";
      completed?: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const load = () =>
      api<{ campaigns: typeof items }>("/api/campaigns")
        .then((result) => {
          if (active) {
            setItems(result.campaigns);
            setError("");
          }
        })
        .catch((cause) => {
          if (active)
            setError(
              cause instanceof Error
                ? cause.message
                : "Campaigns could not be loaded.",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    void load();
    window.addEventListener("campaign-created", load);
    return () => {
      active = false;
      window.removeEventListener("campaign-created", load);
    };
  }, []);
  if (loading)
    return (
      <div className="inline-state">
        <RefreshCw className="spin" /> Loading campaigns…
      </div>
    );
  return (
    <div className="grid">
      {error && (
        <div className="inline-error" role="alert">
          {error}
        </div>
      )}
      {items.length ? (
        items.map((item) => (
          <section className="card" key={item.id} style={{ padding: 17 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "start",
              }}
            >
              <div>
                <Chip tone={item.status === "completed" ? "success" : "brand"}>
                  {item.status}
                </Chip>
                <h2 style={{ fontSize: 14, margin: "10px 0 5px" }}>
                  {item.title}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: 10, margin: 0 }}>
                  {item.audience} assigned · Due{" "}
                  {formatWorkspaceDate(item.dueAt)}
                </p>
              </div>
              <b style={{ fontSize: 12 }}>
                {item.status === "completed"
                  ? "Complete"
                  : `${item.completed || 0}/${item.audience} verified`}
              </b>
            </div>
          </section>
        ))
      ) : (
        <div className="empty-state">
          <Target />
          <h2>No campaigns yet</h2>
          <p>Start a campaign from a material document change.</p>
        </div>
      )}
      <button
        className="btn primary"
        onClick={onCampaign}
        style={{ justifySelf: "start" }}
      >
        <Plus /> New campaign
      </button>
    </div>
  );
}

function RiskPage({
  setPage,
  role,
}: {
  setPage: (p: Page) => void;
  role: Role;
}) {
  const [severity, setSeverity] = useState("Open");
  const [owner, setOwner] = useState("All owners");
  const [division, setDivision] = useState("All divisions");
  const availableRisks =
    role === "Developer"
      ? risks.filter(
          (risk) =>
            risk.severity === "Critical" || risk.detail.includes("Engineering"),
        )
      : risks;
  const filtered = availableRisks.filter(
    (r) =>
      (severity === "Open" || r.severity === severity) &&
      (owner === "All owners" || r.owner === owner) &&
      (division === "All divisions" || r.detail.includes(division)),
  );
  return (
    <>
      <div className="toolbar">
        <div className="segmented" aria-label="Risk status filters">
          {["Open", "Critical", "High", "Resolved"].map((item) => (
            <button
              key={item}
              className={severity === item ? "active" : ""}
              onClick={() => setSeverity(item)}
            >
              {item}
              {` ${
                item === "Open"
                  ? availableRisks.length
                  : item === "Resolved"
                    ? 0
                    : availableRisks.filter((risk) => risk.severity === item)
                        .length
              }`}
            </button>
          ))}
        </div>
        <label className="select-control">
          <Filter /> <span>Division</span>
          <select
            aria-label="Filter risks by division"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          >
            <option>All divisions</option>
            <option>Legal & Compliance</option>
            <option>Customer Support</option>
            <option>Engineering</option>
            <option>Operations</option>
          </select>
        </label>
        <label className="select-control">
          <Users /> <span>Owner</span>
          <select
            aria-label="Filter risks by owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option>All owners</option>
            {[...new Set(availableRisks.map((r) => r.owner))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <section className="card">
        {filtered.length ? (
          filtered.map((r) => (
            <div className="risk-row" key={r.title}>
              <span
                className={`severity-bar ${r.severity === "Critical" ? "critical" : ""}`}
              />
              <div>
                <b>{r.title}</b>
                <p>
                  {r.detail} · Owner: {r.owner}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Chip
                  tone={
                    r.severity === "Critical"
                      ? "critical"
                      : r.severity === "High"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {r.severity}
                </Chip>
                <button
                  className="btn hide-mobile"
                  onClick={() => setPage("changes")}
                >
                  Review <ChevronRight />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <CheckCircle2 />
            <h2>No matching risks</h2>
            <p>No risks match the selected severity, division and owner.</p>
          </div>
        )}
      </section>
    </>
  );
}

type DynamicAssignment = {
  id: string;
  documentId: string;
  status?: "assigned" | "completed" | "failed";
  document?: { title: string; version: string };
  remediation?: {
    status: "assigned" | "completed";
    summary: string;
    citations: string[];
    retryAvailableAt: string;
  };
  analysis?: {
    questions: {
      question: string;
      scenario: string;
      options: string[];
      citation: string;
    }[];
  };
};

function DynamicVerifyPage({
  assignmentId,
  onBack,
}: {
  assignmentId: string;
  onBack: () => void;
}) {
  const [assignment, setAssignment] = useState<DynamicAssignment | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    attemptsRemaining?: number;
    remediation?: {
      summary: string;
      citations: string[];
    } | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retrying, setRetrying] = useState(false);
  useEffect(() => {
    void api<{ assignments: DynamicAssignment[] }>("/api/assignments")
      .then((data) =>
        setAssignment(
          data.assignments.find((item) => item.id === assignmentId) || null,
        ),
      )
      .catch((cause) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "Assignment could not be loaded.",
        ),
      );
  }, [assignmentId]);
  if (error) return <div className="inline-error">{error}</div>;
  if (!assignment)
    return (
      <div className="inline-state">
        <RefreshCw className="spin" /> Loading knowledge test…
      </div>
    );
  if (
    assignment.status === "failed" &&
    assignment.remediation?.status === "assigned" &&
    !retrying &&
    !result
  )
    return (
      <section className="card verification success-state failed-state">
        <div className="success-orb"><BookOpen /></div>
        <Chip tone="warning">Remediation ready</Chip>
        <h2>Review the evidence before retrying</h2>
        <p>{assignment.remediation.summary}</p>
        <div className="remediation-panel">
          <b><Sparkles /> Source-cited learning</b>
          {assignment.remediation.citations.map((citation) => (
            <span key={citation}><FileCheck2 /> {citation}</span>
          ))}
          <button className="btn primary" onClick={() => setRetrying(true)}>
            Start verification retry <ArrowRight />
          </button>
        </div>
      </section>
    );
  if (result)
    return (
      <section
        className={`card verification success-state ${result.passed ? "" : "failed-state"}`}
      >
        <div className="success-orb">{result.passed ? <Check /> : <X />}</div>
        <Chip tone={result.passed ? "success" : "critical"}>
          {result.passed ? "Verified" : "Retry required"}
        </Chip>
        <h2>
          {result.passed
            ? "Understanding confirmed"
            : "Knowledge gap identified"}
        </h2>
        <p>
          You scored {result.score}%. The assignment, manager dashboard and
          readiness record have been updated.
        </p>
        {!result.passed && result.remediation && (
          <div className="remediation-panel">
            <b><Sparkles /> Targeted remediation</b>
            <p>{result.remediation.summary}</p>
            {result.remediation.citations.map((citation) => (
              <span key={citation}><FileCheck2 /> {citation}</span>
            ))}
            {(result.attemptsRemaining || 0) > 0 && (
              <button
                className="btn primary"
                onClick={() => {
                  setAnswers([]);
                  setResult(null);
                }}
              >
                Retry verification <ArrowRight />
              </button>
            )}
          </div>
        )}
      </section>
    );
  const questions = assignment.analysis?.questions || [];
  if (!questions.length)
    return (
      <section className="card empty-state">
        <Clock3 />
        <h2>Verification is still being prepared</h2>
        <p>
          Questions have not been approved for this document yet. No score can
          be submitted until source-backed scenarios are available.
        </p>
        <button className="btn primary" onClick={onBack}>
          Back to my work
        </button>
      </section>
    );
  return (
    <div className="verification">
      <div className="verify-top">
        <span>AI-generated knowledge test · {questions.length} scenarios</span>
        <Chip tone="brand">{assignment.document?.version}</Chip>
      </div>
      <section className="card question">
        <h2>{assignment.document?.title}</h2>
        {questions.map((question, questionIndex: number) => (
          <div className="dynamic-question" key={question.question}>
            <div className="scenario">
              <b>Scenario {questionIndex + 1}</b>
              <br />
              {question.scenario}
            </div>
            <h3>{question.question}</h3>
            <div className="options">
              {question.options.map((option: string, optionIndex: number) => (
                <button
                  className={`option ${answers[questionIndex] === optionIndex ? "selected" : ""}`}
                  key={option}
                  aria-pressed={answers[questionIndex] === optionIndex}
                  onClick={() =>
                    setAnswers((current) => {
                      const next = [...current];
                      next[questionIndex] = optionIndex;
                      return next;
                    })
                  }
                >
                  <span className="letter">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
            <small className="question-citation">
              Source: {question.citation}
            </small>
          </div>
        ))}
        <div className="verify-footer">
          <span>Pass mark: 80%</span>
          <button
            className="btn primary"
            disabled={
              busy ||
              answers.filter((value) => typeof value === "number").length !==
                questions.length
            }
            onClick={async () => {
              setBusy(true);
              try {
                const response = await api<{ passed: boolean; score: number }>(
                  "/api/verify",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      assignmentId,
                      documentId: assignment.documentId,
                      answers,
                    }),
                  },
                );
                setResult(response);
                window.dispatchEvent(new Event("verification-completed"));
              } catch (cause) {
                setError(
                  cause instanceof Error ? cause.message : "Submission failed.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Submitting…" : "Submit verification"} <ArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
}

function VerifyPage({
  assignmentId,
  onBack,
}: {
  assignmentId?: string | null;
  onBack: () => void;
}) {
  if (assignmentId)
    return <DynamicVerifyPage assignmentId={assignmentId} onBack={onBack} />;
  return <SeedVerifyPage />;
}

function SeedVerifyPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  if (done)
    return (
      <section className="card verification success-state">
        <div className="success-orb">
          <Check size={30} />
        </div>
        <Chip tone="success">Verified</Chip>
        <h2 style={{ marginTop: 12 }}>Understanding confirmed</h2>
        <p>
          You scored 100%. Your readiness record and Alethia Health have been
          updated.
        </p>
        <div className="citation" style={{ textAlign: "left", marginTop: 20 }}>
          <span className="doc-icon">
            <FileCheck2 />
          </span>
          <div>
            <b>Customer Data Handling Policy v3.0</b>
            <span>
              Verified 18 Aug 2026 · Valid until the next material change
            </span>
          </div>
        </div>
      </section>
    );
  const options = [
    "Wait for the annual access review",
    "Complete an access review within the new 90-day cycle",
    "Ask the manager to verify on your behalf",
    "Remove the audit record after approval",
  ];
  return (
    <div className="verification">
      <div className="verify-top">
        <span style={{ fontSize: 10, color: "var(--muted)" }}>
          Knowledge check · 1 scenario
        </span>
        <Chip tone="brand">Policy v3.0</Chip>
      </div>
      <div className="progress" style={{ marginBottom: 12 }}>
        <span style={{ width: "100%" }} />
      </div>
      <section className="card question">
        <h2>
          You have privileged access to customer PII. What must you do under the
          updated policy?
        </h2>
        <div className="scenario">
          <b style={{ color: "var(--text)" }}>Scenario</b>
          <br />
          Your last access review was completed 88 days ago and your role still
          requires customer-data access.
        </div>
        <div className="options">
          {options.map((o, i) => (
            <button
              className={`option ${selected === i ? "selected" : ""}`}
              key={o}
              onClick={() => {
                setSelected(i);
                setFeedback("");
              }}
              aria-pressed={selected === i}
            >
              <span className="letter">{String.fromCharCode(65 + i)}</span>
              {o}
            </button>
          ))}
        </div>
        {feedback && (
          <div className="answer-feedback" role="alert">
            <b>Review the approved source</b>
            <span>{feedback}</span>
            <small>Customer Data Handling Policy v3.0 · Section 4.2</small>
          </div>
        )}
        <div className="verify-footer">
          <span style={{ color: "var(--muted)", fontSize: 9 }}>
            Source feedback appears after submission
          </span>
          <button
            className="btn primary"
            disabled={selected === null || submitting}
            onClick={async () => {
              if (selected === null) return;
              setSubmitting(true);
              try {
                const result = await api<{ passed: boolean }>("/api/verify", {
                  method: "POST",
                  body: JSON.stringify({
                    documentId: "doc-policy-v3",
                    selected,
                  }),
                });
                if (result.passed) {
                  setDone(true);
                  window.dispatchEvent(new Event("verification-completed"));
                }
                else
                  setFeedback(
                    "The policy requires an access review every 90 days. Select the action that completes the review within the updated cycle.",
                  );
              } catch (cause) {
                setFeedback(
                  cause instanceof Error
                    ? cause.message
                    : "Verification could not be submitted.",
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? "Submitting…" : "Submit answer"} <ArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingsPage({
  theme,
  setTheme,
  canReset,
}: {
  theme: string;
  setTheme: (v: string) => void;
  canReset: boolean;
}) {
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="grid" style={{ maxWidth: 760 }}>
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Appearance</h2>
            <p>Choose the workspace theme</p>
          </div>
        </div>
        <div className="card-body">
          <div className="segmented" style={{ width: "fit-content" }}>
            <button
              className={theme === "light" ? "active" : ""}
              onClick={() => setTheme("light")}
            >
              <Sun size={12} /> Light
            </button>
            <button
              className={theme === "dark" ? "active" : ""}
              onClick={() => setTheme("dark")}
            >
              <Moon size={12} /> Dark
            </button>
          </div>
        </div>
      </section>
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Agent notifications</h2>
            <p>Manager escalation and readiness summaries</p>
          </div>
        </div>
        <div className="card-body">
          {[
            "Assignment due soon",
            "Verification overdue",
            "Critical risk detected",
            "Weekly readiness summary",
          ].map((x) => (
            <label
              key={x}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                fontSize: 11,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span>{x}</span>
              <input type="checkbox" defaultChecked />
            </label>
          ))}
        </div>
      </section>
      {canReset && (
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Contest demo</h2>
              <p>Manager-only reset restores the verified judging scenario</p>
            </div>
          </div>
          <div className="card-body">
            <button
              className="btn"
              disabled={resetting}
              onClick={async () => {
                setResetting(true);
                setResetDone(false);
                setError("");
                try {
                  await api("/api/demo/reset", { method: "POST" });
                  setResetDone(true);
                } catch (cause) {
                  setError(
                    cause instanceof Error
                      ? cause.message
                      : "Demo data could not be reset.",
                  );
                } finally {
                  setResetting(false);
                }
              }}
            >
              <RefreshCw size={13} />
              {resetting ? "Resetting…" : "Reset demo data"}
            </button>
            {resetDone && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 10,
                  color: "var(--success)",
                }}
              >
                Demo restored successfully.
              </span>
            )}
            {error && (
              <div className="inline-error" role="alert">
                {error}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function IntegrationsPage() {
  const [connectors, setConnectors] = useState<
    { id: string; type: string; lastSyncAt: string | null; schedule?: string; nextSyncAt?: string | null }[]
  >([]);
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sources: {type:string;name:string;config:Record<string,string>}[] = [
    { type:"google-drive", name:"Google Drive", config:{folderId:"company-knowledge"} },
    { type:"sharepoint", name:"Microsoft SharePoint", config:{siteUrl:"https://company.sharepoint.com/sites/knowledge",library:"Policies"} },
    { type:"confluence", name:"Confluence", config:{spaceKey:"KNOW"} },
    { type:"notion", name:"Notion", config:{databaseId:"knowledge-db"} },
    { type:"github", name:"GitHub", config:{repository:"alethia/handbook"} },
    { type:"jira", name:"Jira", config:{projectKey:"OPS"} },
    { type:"lms", name:"Learning management system", config:{baseUrl:"https://lms.example.com",courseId:"knowledge-readiness"} },
  ];
  useEffect(() => {
    let active = true;
    api<{
      connectors: { id: string; type: string; lastSyncAt: string | null; schedule?: string; nextSyncAt?: string | null }[];
    }>("/api/connectors")
      .then((result) => {
        if (active) setConnectors(result.connectors);
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Connections could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const connect = async (
    type: string,
    name: string,
    config: Record<string,string>,
  ) => {
    setBusy(type);
    setError("");
    try {
      const result = await api<{
        connector: { id: string; type: string; lastSyncAt: null; schedule?: string; nextSyncAt?: string | null };
      }>("/api/connectors", {
        method: "POST",
        body: JSON.stringify({
          type,
          name: `${name} knowledge`,
          config,
          schedule: "daily",
        }),
      });
      setConnectors((items) => [...items, result.connector]);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Connector could not be created.",
      );
    } finally {
      setBusy("");
    }
  };
  const sync = async (connector: {
    id: string;
    type: string;
    lastSyncAt: string | null;
  }) => {
    setBusy(connector.type);
    setError("");
    try {
      await api("/api/connectors/sync", {
        method: "POST",
        body: JSON.stringify({
          connectorId: connector.id,
          items: [
            {
              externalId: "qa-handbook",
              title: "Connected Knowledge Handbook",
              content:
                "Section 1\nConnected sources are synchronized incrementally with source metadata and an audit record.",
              version: "v1.0",
              department: "Operations",
            },
          ],
        }),
      });
      setConnectors((items) =>
        items.map((item) =>
          item.id === connector.id
            ? { ...item, lastSyncAt: new Date().toISOString() }
            : item,
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Synchronization failed.",
      );
    } finally {
      setBusy("");
    }
  };
  if (loading)
    return (
      <div className="inline-state">
        <RefreshCw className="spin" /> Loading integrations…
      </div>
    );
  return (
    <>
      {error && (
        <div className="inline-error" role="alert">
          {error}
        </div>
      )}
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}
      >
        {sources.map((source) => {
          const {type,name,config}=source;
          const connector = connectors.find((item) => item.type === type);
          return (
            <section className="card" key={type} style={{ padding: 18 }}>
              <div className="task-icon">
                <Network />
              </div>
              <h2 style={{ fontSize: 14, margin: "14px 0 6px" }}>{name}</h2>
              <p
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  lineHeight: 1.5,
                  minHeight: 32,
                }}
              >
                Import approved knowledge with source metadata and incremental
                sync history.
              </p>
              {connector ? (
                <>
                  <Chip tone="success">Connected</Chip>
                  <p style={{ fontSize: 9, color: "var(--muted)" }}>
                    {connector.lastSyncAt
                      ? `Last synced ${new Date(connector.lastSyncAt).toLocaleString()}`
                      : "Not synced yet"}
                  </p>
                  <p style={{ fontSize: 9, color: "var(--muted)" }}>
                    {connector.schedule || "daily"} sync{connector.nextSyncAt ? ` · next ${new Date(connector.nextSyncAt).toLocaleString()}` : ""}
                  </p>
                  <button
                    className="btn"
                    disabled={busy === type}
                    onClick={() => sync(connector)}
                  >
                    <RefreshCw />
                    {busy === type ? "Syncing…" : "Sync now"}
                  </button>
                </>
              ) : (
                <button
                  className="btn primary"
                  disabled={busy === type}
                  onClick={() => connect(type, name, config)}
                >
                  <Plus />
                  {busy === type ? "Connecting…" : "Connect"}
                </button>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

function AnalyticsPage() {
  const [data, setData] = useState<{
    departments: { department: string; coverage: number }[];
    connectors: unknown[];
    totals: { documents: number; verifications: number; activeRisks:number; resolvedRisks:number; changesDetected:number };
    roi: { hoursSaved:number; manualReviewCostAvoided:number; verificationCoverage:number; riskClosureRate:number; auditPreparationHoursSaved:number; changeAdoptionRate:number };
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api<typeof data>("/api/analytics/advanced")
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Analytics could not be loaded.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  if (error)
    return (
      <div className="inline-error" role="alert">
        {error}
      </div>
    );
  if (!data)
    return (
      <div className="inline-state">
        <RefreshCw className="spin" /> Loading analytics…
      </div>
    );
  return (
    <>
      <div className="grid metrics">
        <div className="card metric">
          <div className="metric-top">
            <span>Indexed documents</span>
            <span className="metric-icon">
              <FileText />
            </span>
          </div>
          <div className="metric-value">{data.totals.documents}</div>
        </div>
        <div className="card metric">
          <div className="metric-top">
            <span>Verification attempts</span>
            <span className="metric-icon">
              <FileCheck2 />
            </span>
          </div>
          <div className="metric-value">{data.totals.verifications}</div>
        </div>
        <div className="card metric">
          <div className="metric-top">
            <span>Connected sources</span>
            <span className="metric-icon">
              <Network />
            </span>
          </div>
          <div className="metric-value">{data.connectors.length}</div>
        </div>
        <div className="card metric">
          <div className="metric-top">
            <span>Departments</span>
            <span className="metric-icon">
              <Users />
            </span>
          </div>
          <div className="metric-value">{data.departments.length}</div>
        </div>
      </div>
      <div className="grid main-grid">
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Department benchmark</h2>
              <p>Verified readiness by organization unit</p>
            </div>
            <Chip tone="success">Live</Chip>
          </div>
          <div className="card-body bar-list">
            {data.departments.map((item) => (
              <div key={item.department}>
                <div className="bar-label">
                  <span>{item.department}</span>
                  <b>{item.coverage}%</b>
                </div>
                <div className="progress">
                  <span style={{ width: `${item.coverage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Connected knowledge</h2>
              <p>Cross-source coverage</p>
            </div>
          </div>
          <div className="card-body">
            <div className="metric-value">{data.connectors.length} sources</div>
            <p style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.6 }}>
              Connected sources share one permission-aware readiness index with
              auditable sync runs.
            </p>
            <Chip tone="brand">Incremental sync</Chip>
          </div>
        </section>
      </div>
      <section className="card" style={{ marginTop: 14 }}>
        <div className="card-head"><div><h2>Executive value & ROI</h2><p>Estimated operational impact from the measured workflow</p></div><Chip tone="brand">Board ready</Chip></div>
        <div className="card-body grid metrics">
          <div className="metric"><span>Hours saved</span><div className="metric-value">{data.roi.hoursSaved}h</div><small>Review and targeting automation</small></div>
          <div className="metric"><span>Cost avoided</span><div className="metric-value">${data.roi.manualReviewCostAvoided.toLocaleString()}</div><small>Estimated manual review cost</small></div>
          <div className="metric"><span>Risk closure</span><div className="metric-value">{data.roi.riskClosureRate}%</div><small>{data.totals.resolvedRisks} findings closed</small></div>
          <div className="metric"><span>Audit preparation saved</span><div className="metric-value">{data.roi.auditPreparationHoursSaved}h</div><small>Evidence assembled automatically</small></div>
        </div>
      </section>
      <ImpactEvidencePanel />
    </>
  );
}

type ImpactEvidenceItem = {
  id: string;
  campaignId: string;
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
};

function ImpactEvidencePanel() {
  const [campaigns, setCampaigns] = useState<
    { id: string; title: string; audience: number; completed: number }[]
  >([]);
  const [evidence, setEvidence] = useState<ImpactEvidenceItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    campaignId: "",
    baselineReadiness: 0,
    currentReadiness: 0,
    manualHoursBefore: 0,
    hoursWithAlethia: 0,
    risksClosed: 0,
    gapsDiscovered: 0,
    managerQuote: "",
    managerName: "",
    evidenceSource: "",
  });
  const load = () =>
    void api<{
      campaigns: typeof campaigns;
      evidence: ImpactEvidenceItem[];
    }>("/api/impact-evidence")
      .then((result) => {
        setCampaigns(result.campaigns);
        setEvidence(result.evidence);
        setForm((current) => ({
          ...current,
          campaignId: current.campaignId || result.campaigns[0]?.id || "",
        }));
      })
      .catch((cause) =>
        setMessage(
          cause instanceof Error
            ? cause.message
            : "Impact evidence could not be loaded.",
        ),
      );
  useEffect(load, []);
  const save = async () => {
    setBusy(true);
    setMessage("");
    try {
      await api("/api/impact-evidence", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("Pilot evidence saved and added to the executive report.");
      setEditing(false);
      load();
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : "Evidence could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="card impact-evidence-card">
      <div className="card-head">
        <div>
          <h2>Verified business impact</h2>
          <p>Campaign baselines, measured outcomes and attributable evidence</p>
        </div>
        <div className="actions">
          <a className="btn" href="/api/executive-report" download>
            <Download /> Executive PDF
          </a>
          <button
            className="btn primary"
            onClick={() => setEditing((value) => !value)}
          >
            <Plus /> Record pilot evidence
          </button>
        </div>
      </div>
      <div className="card-body">
        {evidence.length ? (
          <div className="impact-evidence-grid">
            {evidence.map((item) => {
              const campaign = campaigns.find(
                (entry) => entry.id === item.campaignId,
              );
              const delta = item.currentReadiness - item.baselineReadiness;
              return (
                <article key={item.id}>
                  <small>MEASURED CAMPAIGN</small>
                  <b>{campaign?.title || "Campaign"}</b>
                  <div><strong>{delta >= 0 ? "+" : ""}{delta}</strong><span>readiness points</span></div>
                  <div><strong>{Math.max(0, item.manualHoursBefore - item.hoursWithAlethia)}h</strong><span>verified time saved</span></div>
                  <div><strong>{item.risksClosed}</strong><span>risks closed</span></div>
                  {item.managerQuote && <blockquote>“{item.managerQuote}”<cite>{item.managerName}</cite></blockquote>}
                  <footer>{item.evidenceSource || "Manager-entered pilot evidence"} · {formatWorkspaceDate(item.updatedAt)}</footer>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state compact-empty">
            <Gauge />
            <h3>Establish your first measurable baseline</h3>
            <p>Record verified before-and-after results from a real pilot. Demo estimates are kept separate from evidence.</p>
          </div>
        )}
        {editing && (
          <div className="impact-form">
            <label>Campaign<select value={form.campaignId} onChange={(event) => setForm({ ...form, campaignId: event.target.value })}>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select></label>
            {([
              ["Baseline readiness", "baselineReadiness"],
              ["Current readiness", "currentReadiness"],
              ["Manual hours before", "manualHoursBefore"],
              ["Hours with Alethia", "hoursWithAlethia"],
              ["Risks closed", "risksClosed"],
              ["Gaps discovered", "gapsDiscovered"],
            ] as const).map(([label, key]) => <label key={key}>{label}<input type="number" min="0" max={key.includes("Readiness") ? 100 : undefined} value={form[key]} onChange={(event) => setForm({ ...form, [key]: Number(event.target.value) })} /></label>)}
            <label>Evidence source<input value={form.evidenceSource} onChange={(event) => setForm({ ...form, evidenceSource: event.target.value })} placeholder="Pilot worksheet, audit report or measured workflow" /></label>
            <label>Manager name<input value={form.managerName} onChange={(event) => setForm({ ...form, managerName: event.target.value })} /></label>
            <label className="wide">Manager evidence quote<textarea value={form.managerQuote} onChange={(event) => setForm({ ...form, managerQuote: event.target.value })} placeholder="What changed for the team or business?" /></label>
            <div className="actions wide"><button className="btn" onClick={() => setEditing(false)}>Cancel</button><button className="btn primary" disabled={busy || !form.campaignId || !form.evidenceSource.trim()} onClick={() => void save()}>{busy ? "Saving…" : "Save verified evidence"}</button></div>
          </div>
        )}
        {message && <div className="inline-state" role="status">{message}</div>}
      </div>
    </section>
  );
}

function EmergentStoryPage() {
  const buildMetrics = [
    ["43", "production routes", "Authenticated pages and API workflows"],
    ["4", "role experiences", "Manager, Legal, Developer and Employee"],
    ["7", "knowledge connectors", "Drive, SharePoint, Confluence, Notion, GitHub, Jira and LMS"],
    ["20", "automated checks", "Grounding, permissions, evaluation and policy logic"],
  ];
  const stages = [
    ["01", "Frame the problem", "Converted an ambiguous knowledge-management challenge into one measurable document-to-proof loop."],
    ["02", "Generate the foundation", "Established the application, persistent domain model, role-based workspace and responsive design system."],
    ["03", "Integrate intelligence", "Connected governed AI analysis, source citations, question generation, approval and permission-aware retrieval."],
    ["04", "Close the workflow", "Implemented targeting, employee verification, remediation, audit evidence and leadership reporting."],
    ["05", "Test and refine", "Used iterative UI and end-to-end QA to resolve identity, targeting, access, scoring and feedback defects."],
  ];
  return (
    <div className="emergent-story">
      <section className="emergent-hero card">
        <div>
          <span><Sparkles /> EMERGENT BUILD STORY</span>
          <h2>From business hypothesis to governed readiness product.</h2>
          <p>Emergent accelerated the complete product cycle: problem framing, interface iteration, full-stack workflows, AI integration, persistent data and production-quality validation.</p>
        </div>
        <div className="emergent-loop">
          <b>Approved knowledge</b><ArrowRight /><b>Governed AI</b><ArrowRight /><b>Verified action</b><ArrowRight /><b>Business evidence</b>
        </div>
      </section>
      <div className="emergent-metrics">
        {buildMetrics.map(([value, label, detail]) => (
          <article className="card" key={label}>
            <strong>{value}</strong><b>{label}</b><span>{detail}</span>
          </article>
        ))}
      </div>
      <section className="card emergent-timeline">
        <div className="card-head"><div><h2>How Emergent was used</h2><p>Five connected stages with working product evidence</p></div><Chip tone="success">End to end</Chip></div>
        <div className="card-body">
          {stages.map(([number, title, copy]) => (
            <article key={number}><span>{number}</span><div><b>{title}</b><p>{copy}</p></div></article>
          ))}
        </div>
      </section>
      <div className="grid main-grid">
        <section className="card">
          <div className="card-head"><div><h2>Craft beyond generation</h2><p>Where iteration materially improved the product</p></div></div>
          <div className="card-body build-proof-list">
            {["Real tenant data is separated from guided-demo content.","Managers are division-scoped while organization admins retain authorized visibility.","AI-generated questions require accountable human approval.","Failed assessments trigger cited remediation rather than a dead end.","Campaign metrics distinguish estimates from verified pilot evidence."].map((item) => <span key={item}><CheckCircle2 />{item}</span>)}
          </div>
        </section>
        <section className="card">
          <div className="card-head"><div><h2>Production evidence</h2><p>What judges can inspect directly</p></div></div>
          <div className="card-body build-proof-list">
            {["Working client onboarding and authentication","Persistent document, campaign and verification data","Source-grounded AI with model governance","Downloadable executive PDF and audit exports","Responsive interfaces for every role"].map((item) => <span key={item}><FileCheck2 />{item}</span>)}
          </div>
        </section>
      </div>
    </div>
  );
}

function GovernancePage() {
  const [findings, setFindings] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [policy,setPolicy]=useState<{minConfidence:number;humanApprovalForCritical:boolean;retentionDays:number;crossDivisionIsolation:boolean}|null>(null);
  const [decisions,setDecisions]=useState<{id:string;action:string;model:string;confidence:number;decision:string;approvedBy:string|null}[]>([]);
  useEffect(()=>{void api<{governance:NonNullable<typeof policy>;decisions:typeof decisions}>("/api/governance").then(result=>{setPolicy(result.governance);setDecisions(result.decisions);}).catch(()=>undefined);},[]);
  return (
    <div className="grid main-grid">
      <div className="grid">
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Governance policy</h2>
              <p>Mandatory controls for every AI answer and action</p>
            </div>
            <Chip tone="success">Enforced</Chip>
          </div>
          <div className="card-body">
            {[
              ["Source citations", "Required"],
              ["Minimum confidence", `${Math.round((policy?.minConfidence??.7)*100)}%`],
              ["Critical-risk approval", policy?.humanApprovalForCritical===false?"Optional":"Human required"],
              ["Division isolation", policy?.crossDivisionIsolation===false?"Disabled":"Enforced"],
              ["Audit retention", `${policy?.retentionDays??365} days`],
            ].map(([label, value]) => (
              <div className="kv" key={label}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Approved model</h2>
              <p>alethia-grounded · version 1.0.0</p>
            </div>
            <Chip tone="success">100% eval</Chip>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.6 }}>
              Promotion requires grounded answers, permission enforcement,
              citations and explicit abstention when evidence is insufficient.
            </p>
          </div>
        </section>
      </div>
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Continuous knowledge audit</h2>
            <p>Conflicts, missing citations and access gaps</p>
          </div>
          <Sparkles size={15} color="var(--brand)" />
        </div>
        <div className="card-body">
          <div className="metric-value">
            {findings === null ? "Weekly" : `${findings} findings`}
          </div>
          <p style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.6 }}>
            The audit scans every current source and dispatches department
            agents within their approved action boundaries.
          </p>
          <button
            className="btn primary"
            disabled={running}
            onClick={async () => {
              setRunning(true);
              try {
                const result = await api<{ findings: unknown[] }>(
                  "/api/governance/audits",
                  { method: "POST" },
                );
                setFindings(result.findings.length);
              } finally {
                setRunning(false);
              }
            }}
          >
            <RefreshCw />
            {running ? "Auditing…" : "Run audit now"}
          </button>
        </div>
      </section>
      <section className="card" style={{gridColumn:"1 / -1"}}>
        <div className="card-head"><div><h2>AI decision history</h2><p>Provider, model, confidence, sources and human approval state</p></div><Chip tone="brand">{decisions.length} logged</Chip></div>
        <div className="card-body">
          {decisions.slice(0,6).map(decision=><div className="kv" key={decision.id}><span><b>{decision.action}</b><small style={{display:"block",marginTop:3}}>{decision.model} · {Math.round(decision.confidence*100)}% confidence</small></span><Chip tone={decision.decision==="allowed"?"success":decision.decision==="blocked"?"critical":"warning"}>{decision.decision}</Chip></div>)}
          {!decisions.length&&<p style={{fontSize:10,color:"var(--muted)"}}>AI decisions will appear after an answer or document analysis.</p>}
        </div>
      </section>
    </div>
  );
}

function EnterprisePage() {
  const [admin, setAdmin] = useState<{
    organization: { id: string; name: string };
    memberships: unknown[];
    entitlements: {
      subscription: { plan: string; status: string; seats: number };
      usage: { seats: number };
      limits: { seats: number };
    };
    security: { governance: { retentionDays: number } };
  } | null>(null);
  const [templates, setTemplates] = useState<
    { id: string; name: string; description: string }[]
  >([]);
  const [installed, setInstalled] = useState<string[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      api<typeof admin>("/api/enterprise/admin"),
      api<{ templates: { id: string; name: string; description: string }[] }>(
        "/api/enterprise/templates",
      ),
    ])
      .then(([adminData, templateData]) => {
        if (active) {
          setAdmin(adminData);
          setTemplates(templateData.templates);
        }
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Enterprise data could not be loaded.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  const install = async (id: string) => {
    setBusy(id);
    setError("");
    try {
      await api("/api/enterprise/templates", {
        method: "POST",
        body: JSON.stringify({ templateId: id }),
      });
      setInstalled((items) => [...items, id]);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Template could not be installed.",
      );
    } finally {
      setBusy("");
    }
  };
  if (error && !admin)
    return (
      <div className="inline-error" role="alert">
        {error}
      </div>
    );
  if (!admin)
    return (
      <div className="inline-state">
        <RefreshCw className="spin" /> Loading enterprise administration…
      </div>
    );
  const { subscription, usage } = admin.entitlements;
  const retentionDays = admin.security.governance.retentionDays;
  return (
    <div className="grid">
      {error && (
        <div className="inline-error" role="alert">
          {error}
        </div>
      )}
      <div className="grid metrics">
        <div className="card metric">
          <div className="metric-top">
            <span>Plan</span>
            <span className="metric-icon">
              <BriefcaseBusiness />
            </span>
          </div>
          <div className="metric-value capitalize">{subscription.plan}</div>
          <Chip tone="success">{subscription.status}</Chip>
        </div>
        <div className="card metric">
          <div className="metric-top">
            <span>Seat capacity</span>
            <span className="metric-icon">
              <Users />
            </span>
          </div>
          <div className="metric-value">
            {usage.seats} / {subscription.seats}
          </div>
          <div className="progress">
            <span
              style={{
                width: `${Math.min(100, (usage.seats / subscription.seats) * 100)}%`,
              }}
            />
          </div>
        </div>
        <div className="card metric">
          <div className="metric-top">
            <span>Tenant isolation</span>
            <span className="metric-icon">
              <ShieldAlert />
            </span>
          </div>
          <div className="metric-value">Enforced</div>
          <Chip tone="success">{admin.organization.id}</Chip>
        </div>
        <div className="card metric">
          <div className="metric-top">
            <span>Audit retention</span>
            <span className="metric-icon">
              <Clock3 />
            </span>
          </div>
          <div className="metric-value">{retentionDays} days</div>
          <a className="btn" href="/api/enterprise/audit-export">
            Export CSV
          </a>
          <a className="btn" href="/api/enterprise/audit-export?format=json" style={{marginTop:6}}>
            Evidence package
          </a>
        </div>
      </div>
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Industry workflow templates</h2>
            <p>Deploy documents, campaigns and bounded agent policies</p>
          </div>
        </div>
        <div
          className="card-body grid"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}
        >
          {templates.map((template) => (
            <div className="insight" key={template.id}>
              <div className="insight-top">
                <Sparkles size={13} />
                {template.name}
              </div>
              <p>{template.description}</p>
              {installed.includes(template.id) ? (
                <Chip tone="success">Installed</Chip>
              ) : (
                <button
                  className="btn"
                  disabled={busy === template.id}
                  onClick={() => install(template.id)}
                >
                  {busy === template.id ? "Installing…" : "Install template"}{" "}
                  <ArrowRight />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DocumentDrawer({
  doc,
  onClose,
  onReview = () => {
    onClose();
    document
      .querySelector<HTMLButtonElement>('button[title="Changes"]')
      ?.click();
  },
}: {
  doc: (typeof docs)[number];
  onClose: () => void;
  onReview?: () => void;
}) {
  const isTechnical = doc.category === "Engineering";
  const overview =
    doc.title === "API Authentication Standard"
      ? "Defines approved service authentication, secrets handling, peer review and deployment approval controls."
      : doc.title === "Incident Response SOP"
        ? "Defines on-call acknowledgement, incident command, evidence preservation and recovery verification."
        : "Defines the required controls, responsibilities and evidence for handling customer information across Alethia.";
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-drawer-title"
      >
        <div className="drawer-head">
          <div>
            <Chip tone={doc.risk === "Critical" ? "critical" : "neutral"}>
              {doc.risk} risk
            </Chip>
            <h2 id="document-drawer-title" style={{ marginTop: 10 }}>
              {doc.title}
            </h2>
            <p>
              {doc.category} · {doc.version}
            </p>
          </div>
          <button
            className="icon-btn"
            aria-label="Close document details"
            autoFocus
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <div className="drawer-body">
          <div className="drawer-section">
            <h3>Overview</h3>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "var(--muted)" }}>
              {overview}
            </p>
            <div className="kv">
              <span>Owner</span>
              <b>{doc.owner}</b>
            </div>
            <div className="kv">
              <span>Status</span>
              <Chip tone={doc.status === "Current" ? "success" : "warning"}>
                {doc.status}
              </Chip>
            </div>
            <div className="kv">
              <span>Next review</span>
              <b>{doc.review}</b>
            </div>
            <div className="kv">
              <span>Affected</span>
              <b>{doc.affected} employees</b>
            </div>
          </div>
          <div className="drawer-section">
            <h3>Latest activity</h3>
            <div className="timeline">
              <div className="timeline-item">
                <span className="timeline-dot">
                  <Sparkles />
                </span>
                <div>
                  <b>
                    {isTechnical
                      ? "Technical control review completed"
                      : "AI change analysis completed"}
                  </b>
                  <span>
                    {isTechnical
                      ? "Current version verified against Engineering standards · Today at 09:42"
                      : "7 meaningful changes · Today at 09:42"}
                  </span>
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot">
                  <Users />
                </span>
                <div>
                  <b>Affected audience mapped</b>
                  <span>
                    {isTechnical
                      ? `${doc.affected} Engineering employees mapped to required learning`
                      : `${doc.affected} employees across four divisions`}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            className="btn primary"
            style={{ width: "100%" }}
            onClick={onReview}
          >
            Review impact and sources <ArrowRight />
          </button>
        </div>
      </aside>
    </>
  );
}

type WorkflowAnalysis = {
  documentId: string;
  summary: string;
  businessImpact: string;
  keyChanges: string[];
  affectedDepartments: string[];
  affectedRoles: string[];
  questions: {
    question: string;
    scenario: string;
    options: string[];
    citation: string;
  }[];
  model: string;
  approvalStatus: "pending_review" | "approved" | "rejected";
  approvedBy?: string | null;
  approvalComment?: string;
};

function UploadWorkflowModal({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (assignmentCount: number) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("v1.0");
  const [department, setDepartment] = useState("Engineering");
  const [analysis, setAnalysis] = useState<WorkflowAnalysis | null>(null);
  const [people, setPeople] = useState<
    { id: string; name: string; role: string; department: string }[]
  >([]);
  const [targetType, setTargetType] = useState("department");
  const [targetDepartment, setTargetDepartment] = useState("Engineering");
  const [targetRole, setTargetRole] = useState("developer");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [dueAt, setDueAt] = useState("2026-08-30");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  useEffect(() => {
    void api<{ people: {id:string;name:string;division:string;functionalRole:string}[] }>("/api/client/people")
      .then((result) => setPeople(result.people.map((person)=>({id:person.id,name:person.name,department:person.division,role:person.functionalRole}))))
      .catch(() => undefined);
  }, []);
  const analyze = async () => {
    if (!file || !title.trim())
      return setError("Choose a document and enter its title.");
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("title", title);
      form.set("version", version);
      form.set("department", department);
      const role = document.documentElement.dataset.role?.toLowerCase();
      const response = await fetch("/api/workflows/analyze", {
        method: "POST",
        headers: role ? { "x-demo-role": role } : undefined,
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Analysis failed.");
      setAnalysis({ ...result.analysis, documentId: result.document.id });
      window.dispatchEvent(new Event("document-uploaded"));
      setTargetDepartment(result.analysis.affectedDepartments[0] || department);
      setTargetRole(result.analysis.affectedRoles[0] || "employee");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  };
  const launch = async () => {
    if (!analysis || analysis.approvalStatus !== "approved") {
      setError("Approve the AI-generated questions before assigning them.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        documentId: analysis.documentId,
        title: `${title} knowledge verification`,
        dueAt,
      };
      if (targetType === "department") payload.department = targetDepartment;
      if (targetType === "role") payload.targetRoles = [targetRole];
      if (targetType === "people") payload.userIds = selectedUsers;
      const result = await api<{ campaign: { targetUserIds?: string[] } }>("/api/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      window.dispatchEvent(new Event("campaign-created"));
      onComplete(result.campaign.targetUserIds?.length || 0);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Campaign could not be launched.",
      );
    } finally {
      setBusy(false);
    }
  };
  const decideAnalysis = async (decision: "approved" | "rejected") => {
    if (!analysis) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ analysis: WorkflowAnalysis }>(
        "/api/workflows/analyze",
        {
          method: "PATCH",
          body: JSON.stringify({
            documentId: analysis.documentId,
            decision,
            comment: approvalComment,
          }),
        },
      );
      setAnalysis(result.analysis);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Decision failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="modal workflow-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workflow-title"
      >
        <div className="modal-head">
          <div>
            <Chip tone="brand">AI knowledge workflow</Chip>
            <h2 id="workflow-title">
              {analysis
                ? "Review analysis and assign"
                : "Upload approved knowledge"}
            </h2>
          </div>
          <button
            className="icon-btn"
            aria-label="Close upload workflow"
            autoFocus
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <div className="modal-body">
          {!analysis ? (
            <>
              <label className="upload-drop">
                <UploadCloud />
                <b>{file ? file.name : "Choose a document"}</b>
                <span>PDF, DOCX, TXT, MD, CSV or JSON · max 10 MB</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.csv,.json"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>
              <div className="workflow-form-grid">
                <label>
                  Document title
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>
                <label>
                  Version
                  <input
                    value={version}
                    onChange={(event) => setVersion(event.target.value)}
                  />
                </label>
                <label>
                  Owning department
                  <select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                  >
                    {(people.length ? [...new Set(people.map((person)=>person.department))] : ["Engineering"]).map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="insight">
                <div className="insight-top">
                  <Sparkles /> Generated with {analysis.model}
                </div>
                <p>{analysis.summary}</p>
                <small>{analysis.businessImpact}</small>
              </div>
              <div className="analysis-grid">
                <div>
                  <h3>Material requirements</h3>
                  {analysis.keyChanges.map((change) => (
                    <p key={change}>
                      <CheckCircle2 /> {change}
                    </p>
                  ))}
                </div>
                <div>
                  <h3>Knowledge test</h3>
                  <b>
                    {analysis.questions.length} scenario questions generated
                  </b>
                  <small>Every question includes a source citation.</small>
                </div>
              </div>
              <div className={`approval-review ${analysis.approvalStatus}`}>
                <div>
                  <span>Human approval</span>
                  <b>
                    {analysis.approvalStatus === "approved"
                      ? "Questions approved for assignment"
                      : analysis.approvalStatus === "rejected"
                        ? "Questions rejected"
                        : "Review required before publishing"}
                  </b>
                </div>
                {analysis.approvalStatus !== "approved" && (
                  <>
                    <label>
                      Decision comment
                      <textarea
                        value={approvalComment}
                        onChange={(event) => setApprovalComment(event.target.value)}
                        placeholder="Record why this test is safe and appropriate to publish."
                      />
                    </label>
                    <div className="actions">
                      <button className="btn" disabled={busy} onClick={() => void decideAnalysis("rejected")}>Reject</button>
                      <button className="btn primary" disabled={busy} onClick={() => void decideAnalysis("approved")}><ShieldCheck /> Approve questions</button>
                    </div>
                  </>
                )}
                {analysis.approvalStatus === "approved" && (
                  <small>Approved by {analysis.approvedBy || "an accountable owner"}{analysis.approvalComment ? ` · ${analysis.approvalComment}` : ""}</small>
                )}
              </div>
              <div className="form-row">
                <label>Target audience</label>
                <div className="segmented">
                  {["department", "role", "people"].map((value) => (
                    <button
                      key={value}
                      className={targetType === value ? "active" : ""}
                      onClick={() => setTargetType(value)}
                    >
                      {value === "people"
                        ? "Specific people"
                        : value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {targetType === "department" && (
                <div className="form-row">
                  <label>Department</label>
                  <select
                    value={targetDepartment}
                    onChange={(event) =>
                      setTargetDepartment(event.target.value)
                    }
                  >
                    {[
                      ...new Set(people.map((person) => person.department)),
                    ].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
              )}
              {targetType === "role" && (
                <div className="form-row">
                  <label>Role</label>
                  <select
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                  >
                    {["employee", "developer", "legal", "manager"].map(
                      (value) => (
                        <option key={value}>{value}</option>
                      ),
                    )}
                  </select>
                </div>
              )}
              {targetType === "people" && (
                <div className="people-picker">
                  {people.map((person) => (
                    <label key={person.id}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(person.id)}
                        onChange={() =>
                          setSelectedUsers((current) =>
                            current.includes(person.id)
                              ? current.filter((id) => id !== person.id)
                              : [...current, person.id],
                          )
                        }
                      />
                      <span>
                        <b>{person.name}</b>
                        <small>
                          {person.department} · {person.role}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <div className="form-row">
                <label>Due date</label>
                <input
                  type="date"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                />
              </div>
            </>
          )}
          {error && (
            <div className="inline-error" role="alert">
              {error}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            disabled={
              busy ||
              (analysis !== null && analysis.approvalStatus !== "approved") ||
              (analysis !== null &&
                targetType === "people" &&
                !selectedUsers.length)
            }
            onClick={analysis ? launch : analyze}
          >
            {busy
              ? "Working…"
              : analysis
                ? "Notify and assign"
                : "Analyze with AI"}{" "}
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignModal({
  onClose,
  onStarted,
}: {
  onClose: () => void;
  onStarted: (assignmentCount: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [documents,setDocuments]=useState<{id:string;title:string;version:string;hasGeneratedTest?:boolean}[]>([]);
  const [documentId,setDocumentId]=useState("");
  const [audience, setAudience] = useState(1);
  const [dueAt, setDueAt] = useState("2026-09-15");
  const [passingScore,setPassingScore]=useState(80);
  const [maxAttempts,setMaxAttempts]=useState(3);
  const [questionCount,setQuestionCount]=useState(5);
  const [certificationDays,setCertificationDays]=useState(365);
  const [randomizeQuestions,setRandomizeQuestions]=useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(()=>{Promise.all([api<{documents:{id:string;title:string;version:string;hasGeneratedTest?:boolean}[]}>("/api/documents"),api<{people:{id:string}[]}>("/api/client/people")]).then(([docsResult,peopleResult])=>{const readyDocuments=docsResult.documents.filter((document)=>document.hasGeneratedTest);setDocuments(readyDocuments);const first=readyDocuments[0];if(first){setDocumentId(first.id);setTitle(`${first.title} ${first.version} verification`);}else setError("Analyze and approve a document before starting a campaign.");setAudience(Math.max(1,peopleResult.people.length));}).catch((cause)=>setError(cause instanceof Error?cause.message:"Campaign setup could not be loaded."));},[]);
  const submit = async () => {
    if (!title.trim()) {
      setError("Campaign title is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await api<{ campaign: { targetUserIds?: string[] } }>("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({
          documentId,
          title,
          audience,
          dueAt,
          policy:{passingScore,maxAttempts,questionCount,certificationDays,randomizeQuestions,reminderDaysBefore:2,escalateAfterDays:2},
        }),
      });
      window.dispatchEvent(new Event("campaign-created"));
      onStarted(result.campaign.targetUserIds?.length || 0);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Campaign could not be started.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-title"
      >
        <div className="modal-head">
          <div>
            <Chip tone="brand">New campaign</Chip>
            <h2 id="campaign-title" style={{ marginTop: 9 }}>
              Start knowledge verification
            </h2>
          </div>
          <button
            className="icon-btn"
            aria-label="Close campaign form"
            autoFocus
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <div className="modal-body">
          <div className="insight">
            <div className="insight-top">
              <Sparkles size={13} /> Audience recommended by Alethia
            </div>
            <p>
              {audience} people are available in your authorized workspace scope.
            </p>
            <small>
              Derived from seven material changes and current role permissions
            </small>
          </div>
          <div className="form-row" style={{ marginTop: 16 }}>
            <label htmlFor="campaign-document">Approved document</label>
            <select id="campaign-document" value={documentId} onChange={(event)=>{setDocumentId(event.target.value);const selected=documents.find((item)=>item.id===event.target.value);if(selected)setTitle(`${selected.title} ${selected.version} verification`);}}>
              {documents.map((item)=><option key={item.id} value={item.id}>{item.title} · {item.version}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="campaign-name">Campaign title</label>
            <input
              id="campaign-name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="campaign-audience">Audience</label>
            <select
              id="campaign-audience"
              value={audience}
              onChange={(e) => setAudience(Number(e.target.value))}
            >
              <option value={audience}>All {audience} people in scope</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="campaign-due">Due date</label>
            <input
              id="campaign-due"
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="campaign-escalation">Escalation</label>
            <select id="campaign-escalation">
              <option>Notify manager after 48 hours overdue</option>
              <option>Notify manager immediately when overdue</option>
            </select>
          </div>
          <div className="workflow-form-grid">
            <label>Passing score<input type="number" min="1" max="100" value={passingScore} onChange={(event)=>setPassingScore(Number(event.target.value))}/></label>
            <label>Maximum attempts<input type="number" min="1" max="10" value={maxAttempts} onChange={(event)=>setMaxAttempts(Number(event.target.value))}/></label>
            <label>Question count<input type="number" min="1" max="20" value={questionCount} onChange={(event)=>setQuestionCount(Number(event.target.value))}/></label>
            <label>Certification validity<input type="number" min="1" max="1095" value={certificationDays} onChange={(event)=>setCertificationDays(Number(event.target.value))}/></label>
          </div>
          <label className="toggle-row"><span><b>Randomize questions</b><small>Use a deterministic order per employee</small></span><input type="checkbox" checked={randomizeQuestions} onChange={(event)=>setRandomizeQuestions(event.target.checked)}/></label>
          {error && (
            <div className="inline-error" role="alert">
              {error}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            disabled={submitting || !documentId || !dueAt || !title.trim()}
            onClick={submit}
          >
            <Target /> {submitting ? "Starting…" : "Start campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Palette({
  onClose,
  go,
  groups,
}: {
  onClose: () => void;
  go: (p: Page) => void;
  groups: typeof nav;
}) {
  const [query, setQuery] = useState("");
  const items = groups
    .flatMap((g) => g.items)
    .concat([{ page: "settings" as Page, label: "Settings", icon: Settings }])
    .filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal palette"
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
      >
        <div className="palette-search">
          <Search size={17} />
          <input
            autoFocus
            placeholder="Search pages, documents and actions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-results">
          <div className="nav-label">Navigate</div>
          {items.map((i) => {
            const Icon = i.icon;
            return (
              <button
                className="palette-item"
                key={i.page}
                onClick={() => {
                  go(i.page);
                  onClose();
                }}
              >
                <span className="task-icon">
                  <Icon />
                </span>
                {i.label}
                <span
                  style={{
                    marginLeft: "auto",
                    color: "var(--muted)",
                    fontSize: 9,
                  }}
                >
                  Open
                </span>
              </button>
            );
          })}
          {items.length === 0 && (
            <div className="empty-state">
              <Search />
              <p>No accessible page matches “{query}”.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type WorkspaceContext = { companyName: string; companyInitials: string; name: string; title: string; department: string; accountRole: "org_admin"|"manager"|"member" };
const resetDocumentScroll = () => {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.scrollTop = 0;
  document.body.scrollTop = 0;
  root.style.scrollBehavior = previousBehavior;
};

export function Workspace({ initialRole = "Manager", mode = "demo", workspaceContext }: { initialRole?: Role; mode?: "demo"|"client"; workspaceContext?: WorkspaceContext }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState<Page>("home");
  const [role] = useState<Role>(initialRole);
  const [theme, setTheme] = useState("light");
  const [palette, setPalette] = useState(false);
  const [drawer, setDrawer] = useState<(typeof docs)[number] | null>(null);
  const [campaign, setCampaign] = useState(false);
  const [uploadWorkflow, setUploadWorkflow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [tour, setTour] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [documentCount, setDocumentCount] = useState(6);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(
    null,
  );
  const [userNotifications, setUserNotifications] = useState<
    {
      id: string;
      title: string;
      detail: string;
      assignmentId: string;
      read: boolean;
    }[]
  >([]);
  const openVerification = (assignmentId?: string) => {
    setSelectedAssignment(assignmentId || null);
    setPage("verify");
  };
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.role = role;
  }, [theme, role]);
  useEffect(() => {
    const loadAssignments = () => void api<{
      notifications: typeof userNotifications;
      assignments: { id: string; status: string; analysis?: { questions?: unknown[] } }[];
    }>("/api/assignments")
      .then((result) => {
        setUserNotifications(result.notifications);
        setAssignmentCount(
          result.assignments.filter((assignment) =>
            Boolean(assignment.analysis?.questions?.length) &&
            assignment.status !== "completed",
          ).length,
        );
      })
      .catch(() => undefined);
    loadAssignments();
    window.addEventListener("verification-completed", loadAssignments);
    window.addEventListener("campaign-created", loadAssignments);
    return () => {
      window.removeEventListener("verification-completed", loadAssignments);
      window.removeEventListener("campaign-created", loadAssignments);
    };
  }, []);
  useEffect(() => {
    const staticRoleDocs =
      role === "Manager"
        ? docs
        : role === "Developer"
          ? docs.filter((document) =>
              ["Engineering", "Compliance"].includes(document.category),
            )
          : role === "Employee"
            ? docs.filter((document) => document.category !== "Engineering")
            : docs.filter(
                (document) => document.title !== "API Authentication Standard",
              );
    const loadDocumentCount = () =>
      void api<{ documents: { title: string }[] }>("/api/documents")
        .then((result) => {
          const additional = result.documents.filter(
            (document) =>
              !staticRoleDocs.some((seed) => seed.title === document.title),
          );
          setDocumentCount(staticRoleDocs.length + additional.length);
        })
        .catch(() => setDocumentCount(staticRoleDocs.length));
    loadDocumentCount();
    window.addEventListener("document-uploaded", loadDocumentCount);
    return () =>
      window.removeEventListener("document-uploaded", loadDocumentCount);
  }, [role]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedTheme = localStorage.getItem("alethia-theme");
      const savedRail = localStorage.getItem("alethia-sidebar-collapsed");
      if (savedTheme) setTheme(savedTheme);
      setCollapsed(savedRail === "true");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    localStorage.setItem("alethia-theme", theme);
    localStorage.setItem("alethia-sidebar-collapsed", String(collapsed));
  }, [theme, collapsed]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      resetDocumentScroll();
      document.querySelector<HTMLElement>(".shell")?.scrollTo({
        top: 0,
        behavior: "auto",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [page]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
      if (e.key === "Escape") {
        setPalette(false);
        setDrawer(null);
        setCampaign(false);
        setUploadWorkflow(false);
        setMobileOpen(false);
        setNotifications(false);
        setTour(0);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  const allowedPages = useMemo(() => {
    const pages = pagesForRole(role);
    if (mode === "client" && workspaceContext?.accountRole === "manager") {
      pages.delete("enterprise"); pages.delete("governance"); pages.delete("integrations");
    }
    return pages;
  }, [role, mode, workspaceContext?.accountRole]);
  const visibleNav = useMemo(
    () =>
      nav
        .map((g) => ({
          ...g,
          items: g.items
            .filter((i) => allowedPages.has(i.page))
            .map((item) =>
              item.page === "documents"
                ? { ...item, count: documentCount }
                : item.page === "work"
                  ? {
                      ...item,
                      count:
                        mode === "client"
                          ? assignmentCount || undefined
                          : role === "Employee"
                          ? assignmentCount || workItems.length
                          : assignmentCount +
                            (role === "Developer"
                              ? developerWorkItems.length
                              : workItems.length),
                    }
                : mode === "client" &&
                    ["changes", "campaigns", "risk"].includes(item.page)
                  ? { ...item, count: undefined }
                  : item,
            ),
        }))
        .filter((g) => g.items.length),
    [allowedPages, assignmentCount, documentCount, mode, role],
  );
  const fallbackPersona = role === "Manager"
      ? { name: "Maya Putri", initials: "MP", department: "Legal & Compliance" }
      : role === "Developer"
        ? { name: "Dimas Nugroho", initials: "DN", department: "Engineering" }
        : role === "Legal"
          ? {
              name: "Laila Azzahra",
              initials: "LA",
              department: "Legal & Compliance",
            }
          : {
              name: "Bima Saputra",
              initials: "BS",
              department: "Customer Support",
            };
  const persona = workspaceContext ? { name: workspaceContext.name, initials: workspaceContext.name.split(/\s+/).map((word)=>word[0]).join("").slice(0,2).toUpperCase(), department: workspaceContext.department } : fallbackPersona;
  const companyName = workspaceContext?.companyName || "Alethia Company";
  const companyInitials = workspaceContext?.companyInitials || "AC";
  const render = () => {
    switch (page) {
      case "home":
        return (
          <HomePage setPage={setPage} role={role} onVerify={openVerification} clientMode={mode==="client"} />
        );
      case "work":
        return (
          <section className="card">
            <WorkList
              onVerify={openVerification}
              role={role}
              realOnly={mode === "client"}
            />
          </section>
        );
      case "documents":
        return (
          <DocumentsPage
            onSelect={setDrawer}
            role={role}
            onUpload={() => setUploadWorkflow(true)}
          />
        );
      case "changes":
        return <ImpactPage onCampaign={() => setCampaign(true)} canManage={role === "Manager" || role === "Legal"} />;
      case "assistant":
        return <AssistantPage />;
      case "people":
        return <PeoplePage />;
      case "campaigns":
        return <CampaignsPage onCampaign={() => setCampaign(true)} />;
      case "risk":
        return <RiskPage setPage={setPage} role={role} />;
      case "analytics":
        return <AnalyticsPage />;
      case "governance":
        return <GovernancePage />;
      case "enterprise":
        return <EnterprisePage />;
      case "integrations":
        return <IntegrationsPage />;
      case "emergent":
        return <EmergentStoryPage />;
      case "verify":
        return (
          <VerifyPage
            assignmentId={selectedAssignment}
            onBack={() => setPage("work")}
          />
        );
      case "settings":
        return (
          <SettingsPage
            theme={theme}
            setTheme={setTheme}
            canReset={role === "Manager"}
          />
        );
    }
  };
  const go = (next: Page) => {
    if (allowedPages.has(next)) {
      resetDocumentScroll();
      setPage(next);
      setMobileOpen(false);
    }
  };
  const tourTitles = [
    "",
    "Alethia Health",
    "Alethia Knowledge",
    "Alethia Learn",
    "Alethia Verify",
    "Alethia Risk",
  ];
  const tourCopy = [
    "",
    "Start with a transparent readiness score combining coverage, freshness, learning and risk.",
    "Every AI answer and recommendation stays connected to a current document version and source section.",
    "Assigned work turns approved documents into a focused learning path with an explicit next action.",
    "Scenario-based verification records whether employees understand a material change.",
    "Unresolved gaps become owned campaigns, reminders and auditable escalation.",
  ];
  return (
    <div className={`app ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside
        className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}
        aria-label="Application navigation"
      >
        <div className="brand">
          <span className="brand-mark">A</span>
          <span className="brand-copy">
            <strong>Alethia</strong>
            <span>Trusted knowledge. Verified people.</span>
          </span>
          <button
            className="collapse-btn"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            <ChevronRight />
          </button>
        </div>
        <div className="workspace-switch" aria-label="Current workspace">
          <span className="mini-logo">{companyInitials}</span>
          <span
            className="workspace-name"
            style={{ fontSize: 11, fontWeight: 650 }}
          >
            {companyName}
          </span>
        </div>
        <div className="nav-scroll">
          {visibleNav.map((g) => (
            <nav className="nav-group" key={g.label} aria-label={g.label}>
              <div className="nav-label">{g.label}</div>
              {g.items.map((i) => {
                const Icon = i.icon;
                return (
                  <motion.button
                    key={i.page}
                    title={i.label}
                    className={`nav-item ${page === i.page ? "active" : ""}`}
                    whileHover={reduceMotion ? undefined : { x: 3 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    onClick={() => go(i.page)}
                  >
                    <Icon />
                    <span className="nav-text">{i.label}</span>
                    {i.count && <span className="nav-count">{i.count}</span>}
                  </motion.button>
                );
              })}
            </nav>
          ))}
          <nav className="nav-group">
            <div className="nav-label">Manage</div>
            <button
              title="Settings"
              className={`nav-item ${page === "settings" ? "active" : ""}`}
              onClick={() => go("settings")}
            >
              <Settings />
              <span className="nav-text">Settings</span>
            </button>
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="profile">
            <span className="avatar">{persona.initials}</span>
            <span className="profile-meta">
              <b>{persona.name}</b>
              <span>
                {workspaceContext ? `${workspaceContext.title} · ${persona.department}` : `${role} · ${persona.department}`}
              </span>
            </span>
          </div>
          <button
            className="role-select logout-button"
            aria-label={`Sign out of ${mode} workspace`}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
          >
            <LogOut /> Sign out
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </button>
          <div className="breadcrumbs">
            <span>{companyName}</span>
            <ChevronRight size={12} />
            <strong>
              {page === "home"
                ? `Good morning, ${persona.name.split(" ")[0]}`
                : pageMeta[page][1]}
            </strong>
          </div>
          <button className="search-trigger" onClick={() => setPalette(true)}>
            <Search size={14} />
            <span>Search or jump to…</span>
            <kbd>⌘ K</kbd>
          </button>
          <button
            className="icon-btn hide-mobile"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
          <button
            className="icon-btn"
            aria-label="Notifications"
            aria-expanded={notifications}
            onClick={() => setNotifications((value) => !value)}
          >
            <Bell />
            {userNotifications.some((item) => !item.read) && (
              <span className="notification-dot" />
            )}
          </button>
          {notifications && (
            <div className="notification-panel">
              <b>Notifications</b>
              {userNotifications.filter((item) => !item.read).length ? (
                userNotifications
                  .filter((item) => !item.read)
                  .slice(0, 3)
                  .map((item) => (
                    <div className="notification-item" key={item.id}>
                      <p>
                        <b>{item.title}</b>
                        <br />
                        {item.detail}
                      </p>
                      <button
                        className="text-action"
                        onClick={() => {
                          openVerification(item.assignmentId);
                          setNotifications(false);
                        }}
                      >
                        Start test
                      </button>
                    </div>
                  ))
              ) : (
                <>
                  <p>No unread knowledge assignments.</p>
                  <button
                    className="text-action"
                    onClick={() => {
                      go(
                        role === "Employee" || role === "Developer"
                          ? "work"
                          : "risk",
                      );
                      setNotifications(false);
                    }}
                  >
                    Review workspace
                  </button>
                </>
              )}
            </div>
          )}
        </header>
        <main className="content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={page}
              className="workspace-page"
              initial={reduceMotion ? false : { opacity: 0, y: 9, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -5, filter: "blur(2px)" }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <Header
                page={page}
                onCampaign={() => setCampaign(true)}
                onTour={() => setTour(1)}
                canManage={role === "Manager" || role === "Legal"}
                personaName={persona.name}
                role={role}
                clientMode={mode === "client"}
              />
              {render()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <nav className="mobile-nav">
        {[
          ["home", "Home", Home],
          ["work", "My work", BriefcaseBusiness],
          ["documents", "Knowledge", FileText],
          [
            role === "Employee" || role === "Developer" ? "assistant" : "risk",
            role === "Employee" || role === "Developer" ? "Assistant" : "Risk",
            role === "Employee" || role === "Developer"
              ? MessageSquareText
              : ShieldAlert,
          ],
          ["settings", "More", MoreHorizontal],
        ].map(([p, l, I]) => {
          const Icon = I as typeof Home;
          return (
            <motion.button
              key={p as string}
              className={page === p ? "active" : ""}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              onClick={() => go(p as Page)}
            >
              <Icon />
              {l as string}
            </motion.button>
          );
        })}
      </nav>
      {drawer && (
        <DocumentDrawer doc={drawer} onClose={() => setDrawer(null)} />
      )}{" "}
      {campaign && (role === "Manager" || role === "Legal") && (
        <CampaignModal
          onClose={() => setCampaign(false)}
          onStarted={(assignmentTotal) => {
            setCampaign(false);
            setToastMessage(`${assignmentTotal} assignments created. Reminder and escalation workflow scheduled.`);
            setTimeout(() => setToastMessage(""), 3000);
            setPage("campaigns");
          }}
        />
      )}
      {uploadWorkflow && role === "Manager" && (
        <UploadWorkflowModal
          onClose={() => setUploadWorkflow(false)}
          onComplete={(assignmentTotal) => {
            setUploadWorkflow(false);
            setToastMessage(`${assignmentTotal} assignments created from the approved document.`);
            setTimeout(() => setToastMessage(""), 3000);
            setPage("campaigns");
          }}
        />
      )}
      {palette && (
        <Palette
          onClose={() => setPalette(false)}
          go={go}
          groups={visibleNav}
        />
      )}{" "}
      {tour > 0 && (
        <div
          className="tour"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-title"
        >
          <small>GUIDED TOUR · {tour} OF 5</small>
          <h3 id="tour-title">{tourTitles[tour]}</h3>
          <p>{tourCopy[tour]}</p>
          <div
            className="actions"
            style={{ justifyContent: "space-between", marginTop: 13 }}
          >
            <button className="btn" onClick={() => setTour(0)}>
              Skip
            </button>
            <span className="actions">
              {tour > 1 && (
                <button className="btn" onClick={() => setTour(tour - 1)}>
                  Back
                </button>
              )}
              <button
                className="btn primary"
                autoFocus
                onClick={() => (tour === 5 ? setTour(0) : setTour(tour + 1))}
              >
                {tour === 5 ? "Finish" : "Next"}
                <ArrowRight />
              </button>
            </span>
          </div>
        </div>
      )}
      {toastMessage && (
        <div className="tour" role="status" style={{ width: 300 }}>
          <div className="insight-top" style={{ color: "#7ce5ad" }}>
            <CheckCircle2 size={15} /> Campaign started
          </div>
          <p>{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
