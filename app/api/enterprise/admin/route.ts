import { getOrganizationId, requireOrgAdmin } from "@/lib/auth";
import { getEntitlements } from "@/lib/enterprise";
import { readDb } from "@/lib/store";

export async function GET(request: Request) {
  try {
    requireOrgAdmin(request);
    const db = await readDb();
    const id = getOrganizationId(request);
    const organization = db.organizations.find(item => item.id === id);
    const entitlements = getEntitlements(db, id);
    if (!organization || !entitlements) return Response.json({ error: "organization not found" }, { status: 404 });
    return Response.json({
      organization,
      memberships: db.memberships.filter(item => item.organizationId === id),
      entitlements,
      security: { sso: db.sso, governance: db.governance },
      activity: db.audit.filter(event => event.organizationId === id).slice(0, 25),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
