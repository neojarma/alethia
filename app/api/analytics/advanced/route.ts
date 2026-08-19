import {
  getAccountRole,
  getDivisionScope,
  getOrganizationId,
  requireRole,
} from "@/lib/auth";
import { readDb } from "@/lib/store";

export async function GET(request: Request) {
  try {
    requireRole(request, ["manager", "legal"]);
    const db = await readDb();
    const organizationId = getOrganizationId(request);
    const divisionId = getDivisionScope(request);
    const clientRequest = Boolean(getAccountRole(request));
    const clientUsers = db.clientAccounts.filter(
      (user) =>
        user.organizationId === organizationId &&
        (!divisionId || user.divisionId === divisionId),
    );
    const clientUserIds = new Set(clientUsers.map((user) => user.id));
    const scopedAssignments = clientRequest
      ? db.knowledgeAssignments.filter((item) => clientUserIds.has(item.userId))
      : db.knowledgeAssignments;
    const scopedAssignmentIds = new Set(scopedAssignments.map((item) => item.id));
    const documents = db.documents.filter((document) =>
      clientRequest
        ? document.organizationId === organizationId &&
          (!divisionId || !document.divisionId || document.divisionId === divisionId)
        : !document.organizationId || document.organizationId === organizationId,
    );
    const documentIds = new Set(documents.map((document) => document.id));
    const connectors = db.connectors
      .filter((connector) =>
        clientRequest
          ? connector.organizationId === organizationId &&
            (!divisionId || !connector.divisionId || connector.divisionId === divisionId)
          : !connector.organizationId || connector.organizationId === organizationId,
      )
      .map((connector) => ({
        id: connector.id,
        name: connector.name,
        type: connector.type,
        lastSyncAt: connector.lastSyncAt,
        nextSyncAt: connector.nextSyncAt,
        schedule: connector.schedule,
        imports: db.syncRuns
          .filter((run) => run.connectorId === connector.id)
          .reduce((sum, run) => sum + run.imported, 0),
        updates: db.syncRuns
          .filter((run) => run.connectorId === connector.id)
          .reduce((sum, run) => sum + run.updated, 0),
      }));
    const departments = clientRequest
      ? db.divisions
          .filter(
            (division) =>
              division.organizationId === organizationId &&
              (!divisionId || division.id === divisionId),
          )
          .map((division) => {
            const users = clientUsers.filter(
              (user) => user.divisionId === division.id,
            );
            const ids = new Set(users.map((user) => user.id));
            const assignments = scopedAssignments.filter((item) =>
              ids.has(item.userId),
            );
            const completed = assignments.filter(
              (item) => item.status === "completed",
            );
            return {
              department: division.name,
              people: users.length,
              verified: new Set(completed.map((item) => item.userId)).size,
              coverage: assignments.length
                ? Math.round((completed.length / assignments.length) * 100)
                : 0,
            };
          })
      : [...new Set(db.users.map((user) => user.department))].map(
          (department) => {
            const users = db.users.filter(
              (user) => user.department === department,
            );
            const verified = users.filter((user) => user.verified).length;
            return {
              department,
              people: users.length,
              verified,
              coverage: Math.round((verified / users.length) * 100),
            };
          },
        );
    const scopedRisks = db.risks.filter((risk) => documentIds.has(risk.documentId));
    const scopedChanges = db.changeIntelligence.filter((change) =>
      documentIds.has(change.documentId),
    );
    const completed = scopedAssignments.filter(
      (item) => item.status === "completed",
    ).length;
    const resolvedRisks = scopedRisks.filter(
      (risk) => risk.status === "resolved",
    ).length;
    const activeRisks = scopedRisks.filter(
      (risk) => risk.status === "open",
    ).length;
    const hoursBase =
      documents.length * 1.5 +
      scopedChanges.length * 2.25 +
      scopedAssignments.length * 0.2;
    const roi = {
      hoursSaved: Math.round(hoursBase * 10) / 10,
      manualReviewCostAvoided: Math.round(
        (documents.length * 1.5 + scopedChanges.length * 2.25) * 75,
      ),
      verificationCoverage: scopedAssignments.length
        ? Math.round((completed / scopedAssignments.length) * 100)
        : clientRequest
          ? 0
          : Math.round(
              (db.users.filter((user) => user.verified).length /
                Math.max(db.users.length, 1)) *
                100,
            ),
      riskClosureRate:
        resolvedRisks + activeRisks
          ? Math.round((resolvedRisks / (resolvedRisks + activeRisks)) * 100)
          : 100,
      auditPreparationHoursSaved:
        Math.round(
          ((clientRequest
            ? db.audit.filter((item) => item.organizationId === organizationId)
            : db.audit
          ).length *
            0.08 +
            db.verifications.filter(
              (item) => item.assignmentId && scopedAssignmentIds.has(item.assignmentId),
            ).length *
              0.25) *
            10,
        ) / 10,
      changeAdoptionRate: scopedChanges.length
        ? Math.round(
            (scopedChanges.filter(
              (change) => change.status === "campaign-created",
            ).length /
              scopedChanges.length) *
              100,
          )
        : 0,
    };
    return Response.json({
      departments,
      connectors,
      totals: {
        people: clientRequest ? clientUsers.length : db.users.length,
        documents: documents.length,
        teams: clientRequest
          ? db.teams.filter((team) =>
              team.memberIds.some((id) => clientUserIds.has(id)),
            ).length
          : db.teams.length,
        events: clientRequest ? 0 : db.analytics.length,
        verifications: db.verifications.filter(
          (item) => item.assignmentId && scopedAssignmentIds.has(item.assignmentId),
        ).length,
        activeRisks,
        resolvedRisks,
        changesDetected: scopedChanges.length,
      },
      roi,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
