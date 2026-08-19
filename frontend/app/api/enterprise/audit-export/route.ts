import { getOrganizationId, requireOrgAdmin } from "@/lib/auth";
import { toAuditCsv } from "@/lib/enterprise";
import { readDb } from "@/lib/store";

export async function GET(request: Request) {
  try {
    requireOrgAdmin(request);
    const db = await readDb();
    const organizationId = getOrganizationId(request);
    if (!db.organizations.some(item => item.id === organizationId)) return Response.json({ error: "organization not found" }, { status: 404 });
    const format = new URL(request.url).searchParams.get("format") || "csv";
    if (format === "json") {
      const documents = db.documents.filter(item => !item.organizationId || item.organizationId === organizationId);
      const documentIds = new Set(documents.map(item => item.id));
      const campaigns = db.campaigns.filter(item => documentIds.has(item.documentId));
      const campaignIds = new Set(campaigns.map(item => item.id));
      const assignments = db.knowledgeAssignments.filter(item => campaignIds.has(item.campaignId));
      const assignmentIds = new Set(assignments.map(item => item.id));
      const evidence = {
        schemaVersion: "1.0",
        generatedAt: new Date().toISOString(),
        organization: db.organizations.find(item => item.id === organizationId),
        controls: db.governance,
        summary: { documents: documents.length, campaigns: campaigns.length, assignments: assignments.length, completed: assignments.filter(item => item.status === "completed").length, verifications: db.verifications.filter(item => item.assignmentId && assignmentIds.has(item.assignmentId)).length, aiDecisions: db.aiDecisionLogs.length },
        documents: documents.map(({ content, chunks, ...document }) => ({ ...document, contentDigest: document.contentHash || `legacy-${content.length}`, sourceSections: chunks.length })),
        versions: db.documentVersions.filter(item => documentIds.has(item.documentId)).map(({ content, ...version }) => ({ ...version, contentLength: content.length })),
        changes: db.changeIntelligence.filter(item => documentIds.has(item.documentId)),
        campaigns,
        assignments,
        verifications: db.verifications.filter(item => !item.assignmentId || assignmentIds.has(item.assignmentId)),
        aiDecisions: db.aiDecisionLogs,
        auditEvents: db.audit.filter(item => !item.organizationId || item.organizationId === organizationId),
      };
      return Response.json(evidence, { headers: { "content-disposition": `attachment; filename="${organizationId}-evidence.json"`, "cache-control": "no-store" } });
    }
    const csv = toAuditCsv(db, organizationId);
    return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${organizationId}-audit.csv"` } });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
