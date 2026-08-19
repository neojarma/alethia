import { requireRole } from "@/lib/auth";
import { runKnowledgeAudit } from "@/lib/governance-engine";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) { try { requireRole(request, ["manager", "legal"]); const db = await readDb(); return Response.json({ schedules: db.auditSchedules, findings: db.governanceFindings }); } catch (error) { if (error instanceof Response) return error; throw error; } }
export async function POST(request: Request) { try { const role = requireRole(request, ["manager", "legal"]); const result = await mutateDb(db => { const findings = runKnowledgeAudit(db); db.governanceFindings = findings; const now = new Date().toISOString(); db.auditSchedules.filter(x => x.enabled).forEach(x => x.lastRunAt = now); db.audit.unshift({ id: `audit-governance-${Date.now()}`, actor: role, action: "governance.audit", detail: `${findings.length} findings`, createdAt: now }); return findings; }); return Response.json({ findings: result, completedAt: new Date().toISOString() }); } catch (error) { if (error instanceof Response) return error; throw error; } }
