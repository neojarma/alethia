import type { DemoRole } from "./domain";
import { readAuthContext } from "./client-auth";

const roles: DemoRole[] = ["manager", "employee", "developer", "legal"];
export function getRole(request: Request): DemoRole {
  const clientContext = readAuthContext(request.headers.get("cookie"));
  if (clientContext) return clientContext.accountRole === "org_admin" || clientContext.accountRole === "manager" ? "manager" : clientContext.functionalRole;
  const cookieRole = request.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)alethia-demo-role=([^;]+)/)?.[1];
  const value = (cookieRole ||
    request.headers.get("x-demo-role")?.toLowerCase()) as DemoRole | undefined;
  return value && roles.includes(value) ? value : "manager";
}
export function requireRole(request: Request, allowed: DemoRole[]) {
  const clientContext = readAuthContext(request.headers.get("cookie"));
  const managementOnly =
    allowed.includes("manager") &&
    !allowed.includes("employee") &&
    !allowed.includes("developer");
  if (clientContext?.accountRole === "member" && managementOnly)
    throw new Response(
      JSON.stringify({ error: "Manager access required", role: clientContext.functionalRole }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  const role = getRole(request);
  if (!allowed.includes(role))
    throw new Response(JSON.stringify({ error: "Forbidden", role }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  return role;
}
export function getOrganizationId(request: Request) {
  return readAuthContext(request.headers.get("cookie"))?.organizationId || request.headers.get("x-organization-id") || "org-alethia";
}
export function getDemoUserId(request: Request) {
  const clientUserId = readAuthContext(request.headers.get("cookie"))?.userId;
  if (clientUserId) return clientUserId;
  const role = getRole(request);
  return role === "manager"
    ? "u1"
    : role === "legal"
      ? "u4"
      : role === "developer"
        ? "u3"
        : "u2";
}
export function getDivisionScope(request: Request) {
  const context = readAuthContext(request.headers.get("cookie"));
  return context?.accountRole === "org_admin" ? null : context?.divisionId || null;
}
export function getAccountRole(request: Request) {
  return readAuthContext(request.headers.get("cookie"))?.accountRole || null;
}
export function requireOrgAdmin(request: Request) {
  const accountRole = getAccountRole(request);
  if (accountRole && accountRole !== "org_admin")
    throw new Response(JSON.stringify({ error: "Organization administrator access required" }), { status: 403, headers: { "content-type": "application/json" } });
  // The guided demo intentionally exposes governance evidence to its Legal
  // persona. Real client sessions still require the org_admin account role.
  return requireRole(request, ["manager", "legal"]);
}
