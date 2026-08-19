import { getOrganizationId, requireRole } from "@/lib/auth";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) {
  try {
    requireRole(request, ["manager", "legal"]);
    const organizationId = getOrganizationId(request);
    const db = await readDb();
    const campaigns = db.campaigns.filter(
      (campaign) =>
        !campaign.organizationId || campaign.organizationId === organizationId,
    );
    return Response.json({
      evidence: db.impactEvidence.filter((item) =>
        campaigns.some((campaign) => campaign.id === item.campaignId),
      ),
      campaigns: campaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        audience: campaign.audience,
        dueAt: campaign.dueAt,
        completed: campaign.targetUserIds?.filter((userId) =>
          db.knowledgeAssignments.some(
            (assignment) =>
              assignment.campaignId === campaign.id &&
              assignment.userId === userId &&
              assignment.status === "completed",
          ),
        ).length || 0,
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const role = requireRole(request, ["manager", "legal"]);
    const organizationId = getOrganizationId(request);
    const body = (await request.json()) as {
      campaignId?: string;
      baselineReadiness?: number;
      currentReadiness?: number;
      manualHoursBefore?: number;
      hoursWithAlethia?: number;
      risksClosed?: number;
      gapsDiscovered?: number;
      managerQuote?: string;
      managerName?: string;
      evidenceSource?: string;
    };
    const numericFields = [
      body.baselineReadiness,
      body.currentReadiness,
      body.manualHoursBefore,
      body.hoursWithAlethia,
      body.risksClosed,
      body.gapsDiscovered,
    ];
    if (
      !body.campaignId ||
      !String(body.evidenceSource || "").trim() ||
      numericFields.some(
        (value) => typeof value !== "number" || value < 0,
      )
    )
      return Response.json(
        { error: "Campaign, evidence source and non-negative impact measurements are required." },
        { status: 400 },
      );
    if (
      body.baselineReadiness! > 100 ||
      body.currentReadiness! > 100
    )
      return Response.json(
        { error: "Readiness values must be between 0 and 100." },
        { status: 400 },
      );
    const evidence = await mutateDb((db) => {
      const campaign = db.campaigns.find(
        (item) =>
          item.id === body.campaignId &&
          (!item.organizationId || item.organizationId === organizationId),
      );
      if (!campaign) return null;
      const record = {
        id: `impact-${campaign.id}`,
        campaignId: campaign.id,
        organizationId,
        baselineReadiness: body.baselineReadiness!,
        currentReadiness: body.currentReadiness!,
        manualHoursBefore: body.manualHoursBefore!,
        hoursWithAlethia: body.hoursWithAlethia!,
        risksClosed: body.risksClosed!,
        gapsDiscovered: body.gapsDiscovered!,
        managerQuote: String(body.managerQuote || "").trim(),
        managerName: String(body.managerName || "").trim(),
        evidenceSource: String(body.evidenceSource || "").trim(),
        updatedAt: new Date().toISOString(),
      };
      const index = db.impactEvidence.findIndex(
        (item) => item.campaignId === campaign.id,
      );
      if (index >= 0) db.impactEvidence[index] = record;
      else db.impactEvidence.push(record);
      db.audit.unshift({
        id: `audit-${Date.now()}`,
        actor: role,
        action: "impact.evidence-recorded",
        detail: `${campaign.title}: ${record.currentReadiness - record.baselineReadiness} readiness-point change and ${Math.max(0, record.manualHoursBefore - record.hoursWithAlethia)} hours saved`,
        createdAt: new Date().toISOString(),
        organizationId,
      });
      return record;
    });
    if (!evidence)
      return Response.json({ error: "Campaign was not found." }, { status: 404 });
    return Response.json({ evidence }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
