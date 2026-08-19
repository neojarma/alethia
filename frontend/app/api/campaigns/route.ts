import { requireRole, getOrganizationId, getDivisionScope, getAccountRole } from "@/lib/auth";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) {
  try {
    requireRole(request, ["manager", "legal"]);
    const db = await readDb();
    return Response.json({
      campaigns: db.campaigns.filter((campaign)=> (getAccountRole(request) ? campaign.organizationId===getOrganizationId(request) : (!campaign.organizationId || campaign.organizationId===getOrganizationId(request))) && (!getDivisionScope(request) || !campaign.divisionId || campaign.divisionId===getDivisionScope(request))).map((campaign) => ({
        ...campaign,
        completed:
          campaign.targetUserIds?.filter((userId) =>
            db.knowledgeAssignments.some(
              (item) =>
                item.campaignId === campaign.id &&
                item.userId === userId &&
                item.status === "completed",
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
    const body = (await request.json()) as {
      documentId?: string;
      title?: string;
      audience?: number;
      dueAt?: string;
      department?: string | null;
      targetRoles?: import("@/lib/domain").DemoRole[];
      userIds?: string[];
      policy?: Partial<NonNullable<import("@/lib/domain").CampaignRecord["policy"]>>;
    };
    if (!body.documentId || !body.title?.trim() || !body.dueAt)
      return Response.json(
        { error: "documentId, title and dueAt are required" },
        { status: 400 },
      );
    const dbSnapshot = await readDb();
    const organizationId=getOrganizationId(request); const scopeDivisionId=getDivisionScope(request);
    const clientRequest=Boolean(getAccountRole(request));
    const document=dbSnapshot.documents.find((item)=>item.id===body.documentId&&(clientRequest?item.organizationId===organizationId:(!item.organizationId||item.organizationId===organizationId))&&(!scopeDivisionId||!item.divisionId||item.divisionId===scopeDivisionId));
    if(!document)return Response.json({error:"Document is outside your workspace scope"},{status:404});
    const divisionId=scopeDivisionId || dbSnapshot.divisions.find((item)=>item.organizationId===organizationId&&item.name===body.department)?.id || null;
    const hasTargeting = Boolean(
      body.userIds?.length || body.department || body.targetRoles?.length,
    );
    const clientUsers=dbSnapshot.clientAccounts.filter((user)=>user.organizationId===organizationId&&(!divisionId||user.divisionId===divisionId));
    const candidateUsers=clientRequest
      ? clientUsers.map((user)=>({id:user.id,department:dbSnapshot.divisions.find((d)=>d.id===user.divisionId)?.name||"",role:user.functionalRole}))
      : dbSnapshot.users;
    const selectedUsers = hasTargeting
      ? candidateUsers.filter((user) =>
          body.userIds?.length
            ? body.userIds.includes(user.id)
            : (!body.department || user.department === body.department) &&
              (!body.targetRoles?.length ||
                body.targetRoles.includes(user.role)),
        )
      : [];
    const audience = hasTargeting
      ? selectedUsers.length
      : (body.audience ?? 40);
    if (!Number.isInteger(audience) || audience < 1)
      return Response.json(
        { error: "audience must be a positive integer" },
        { status: 400 },
      );
    if (Number.isNaN(Date.parse(body.dueAt)))
      return Response.json(
        { error: "dueAt must be a valid date" },
        { status: 400 },
      );
    const approvedAnalysis = dbSnapshot.documentAnalyses.find(
      (analysis) =>
        analysis.documentId === document.id &&
        analysis.questions.length > 0 &&
        analysis.approvalStatus === "approved",
    );
    if (!approvedAnalysis)
      return Response.json(
        { error: "Generate and approve source-backed questions before starting a campaign." },
        { status: 409 },
      );
    const campaign = await mutateDb((db) => {
      const targetUserIds = hasTargeting
        ? selectedUsers.map((user) => user.id)
        : candidateUsers.slice(0, audience).map((user) => user.id);
      const item = {
        id: `camp-${Date.now()}`,
        documentId: body.documentId!,
        title: body.title!.trim(),
        audience: targetUserIds.length,
        dueAt: body.dueAt!,
        status: "active" as const,
        createdAt: new Date().toISOString(),
        targetUserIds,
        department: body.department || null,
        targetRoles: body.targetRoles || [],
        organizationId,
        divisionId,
        policy: {
          passingScore: Math.min(100, Math.max(1, body.policy?.passingScore ?? 80)),
          maxAttempts: Math.min(10, Math.max(1, body.policy?.maxAttempts ?? 3)),
          questionCount: Math.min(20, Math.max(1, body.policy?.questionCount ?? 5)),
          randomizeQuestions: body.policy?.randomizeQuestions ?? true,
          certificationDays: Math.min(1095, Math.max(1, body.policy?.certificationDays ?? 365)),
          reminderDaysBefore: Math.min(30, Math.max(0, body.policy?.reminderDaysBefore ?? 2)),
          escalateAfterDays: Math.min(30, Math.max(0, body.policy?.escalateAfterDays ?? 1)),
        },
      };
      db.campaigns.push(item);
      targetUserIds.forEach((userId, index) => {
          const assignmentId = `assignment-${Date.now()}-${index}`;
          db.knowledgeAssignments.push({
            id: assignmentId,
            campaignId: item.id,
            documentId: item.documentId,
            userId,
            status: "assigned",
            dueAt: item.dueAt,
            score: null,
            completedAt: null,
            createdAt: new Date().toISOString(),
          });
          db.notifications.unshift({
            id: `notification-${Date.now()}-${index}`,
            userId,
            assignmentId,
            title: `Knowledge verification assigned: ${item.title}`,
            detail: `Complete the AI-generated knowledge test by ${item.dueAt}.`,
            read: false,
            createdAt: new Date().toISOString(),
          });
          db.agentTasks.push({ id: `reminder-${assignmentId}`, type: "verification-reminder", status: "scheduled", detail: `${userId} · remind ${item.policy.reminderDaysBefore} day(s) before ${item.dueAt}`, createdAt: new Date().toISOString() });
          db.agentTasks.push({ id: `escalation-${assignmentId}`, type: "manager-escalation", status: "scheduled", detail: `${userId} · escalate ${item.policy.escalateAfterDays} day(s) after ${item.dueAt}`, createdAt: new Date().toISOString() });
        });
      db.audit.unshift({
        id: `audit-${Date.now()}`,
        actor: role,
        action: "campaign.started",
        detail: `${item.title} assigned to ${item.audience} employees`,
        createdAt: new Date().toISOString(),
      });
      return item;
    });
    return Response.json({ campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
