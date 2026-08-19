import { getOrganizationId, requireOrgAdmin } from "@/lib/auth";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) {
  try {
    requireOrgAdmin(request);
    const db = await readDb();
    return Response.json({ templates: db.workflowTemplates });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const role = requireOrgAdmin(request);
    const organizationId = getOrganizationId(request);
    const body = await request.json() as { templateId?: string };
    const result = await mutateDb(db => {
      if (!db.organizations.some(item => item.id === organizationId)) return null;
      const template = db.workflowTemplates.find(item => item.id === body.templateId);
      if (!template) return null;
      const now = new Date().toISOString();
      const agent = { id: `template-agent-${Date.now()}`, name: `${template.industry} readiness agent`, department: "Operations", enabled: true, actions: template.agentActions, escalationRole: "manager" as const, lastRunAt: null };
      db.departmentAgents.push(agent);
      db.audit.unshift({ id: `audit-template-${Date.now()}`, actor: role, action: "template.instantiated", detail: `${template.name}: ${template.documents.length} document blueprints, ${template.campaigns.length} campaign blueprints`, createdAt: now, organizationId });
      return { template, agent, documentBlueprints: template.documents, campaignBlueprints: template.campaigns };
    });
    return result ? Response.json(result, { status: 201 }) : Response.json({ error: "organization or template not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
