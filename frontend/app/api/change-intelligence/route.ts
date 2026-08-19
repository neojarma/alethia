import {
  getAccountRole,
  getDivisionScope,
  getOrganizationId,
  requireRole,
} from "@/lib/auth";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) {
  try {
    requireRole(request, ["manager", "legal"]);
    const organizationId = getOrganizationId(request);
    const db = await readDb();
    const documentIds = new Set(
      db.documents
        .filter((document) => !document.organizationId || document.organizationId === organizationId)
        .map((document) => document.id),
    );
    return Response.json({
      changes: db.changeIntelligence.filter((change) => documentIds.has(change.documentId)),
      versions: db.documentVersions.filter((version) => documentIds.has(version.documentId)),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

export async function PUT(request: Request) {
  try {
    const role = requireRole(request, ["manager", "legal"]);
    const body = (await request.json()) as { id?: string; action?: "approve" | "launch-reverification"; dueAt?: string };
    if (!body.id || !body.action || !["approve", "launch-reverification"].includes(body.action))
      return Response.json({ error: "A valid id and action are required" }, { status: 400 });
    const organizationId = getOrganizationId(request);
    const divisionId = getDivisionScope(request);
    const clientRequest = Boolean(getAccountRole(request));
    const result = await mutateDb((db) => {
      const allowedDocumentIds = new Set(
        db.documents
          .filter((document) =>
            clientRequest
              ? document.organizationId === organizationId &&
                (!divisionId || !document.divisionId || document.divisionId === divisionId)
              : !document.organizationId || document.organizationId === organizationId,
          )
          .map((document) => document.id),
      );
      const change = db.changeIntelligence.find(
        (item) => item.id === body.id && allowedDocumentIds.has(item.documentId),
      );
      if (!change) return null;
      const document = db.documents.find((item) => item.id === change.documentId)!;
      const now = new Date().toISOString();
      if (body.action === "approve") change.status = "approved";
      if (body.action === "launch-reverification") {
        const dueAt = body.dueAt && !Number.isNaN(Date.parse(body.dueAt)) ? body.dueAt : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
        const campaignId = `camp-change-${Date.now()}`;
        db.campaigns.push({ id: campaignId, documentId: change.documentId, title: `Required re-verification · ${change.toVersion}`, audience: change.affectedUserIds.length, dueAt, status: "active", createdAt: now, targetUserIds: change.affectedUserIds, targetRoles: change.affectedRoles, organizationId, divisionId: document.divisionId || divisionId, policy: { passingScore: 80, maxAttempts: 3, questionCount: 5, randomizeQuestions: true, certificationDays: 365, reminderDaysBefore: 2, escalateAfterDays: 1 } });
        change.affectedUserIds.forEach((userId, index) => db.knowledgeAssignments.push({ id: `assignment-change-${Date.now()}-${index}`, campaignId, documentId: change.documentId, userId, status: "assigned", dueAt, score: null, completedAt: null, createdAt: now }));
        change.status = "campaign-created";
      }
      db.audit.unshift({ id: `audit-change-${Date.now()}`, actor: role, action: `change.${body.action}`, detail: `${change.documentId} ${change.fromVersion} → ${change.toVersion}`, organizationId, createdAt: now });
      return change;
    });
    return result ? Response.json({ change: result }) : Response.json({ error: "change not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
