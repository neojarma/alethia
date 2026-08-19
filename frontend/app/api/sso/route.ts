import { requireRole } from "@/lib/auth";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) { try { requireRole(request, ["manager"]); const db = await readDb(); return Response.json({ sso: db.sso }); } catch (error) { if (error instanceof Response) return error; throw error; } }
export async function PUT(request: Request) {
  try { requireRole(request, ["manager"]); const body = await request.json() as { enabled?: boolean; provider?: "oidc" | "saml"; issuer?: string; clientId?: string; allowedDomain?: string }; if (!body.provider || !body.allowedDomain) return Response.json({ error: "provider and allowedDomain are required" }, { status: 400 }); if (body.enabled && (!body.issuer || !body.clientId)) return Response.json({ error: "issuer and clientId are required when SSO is enabled" }, { status: 400 }); const sso = await mutateDb(db => db.sso = { enabled: Boolean(body.enabled), provider: body.provider!, issuer: body.issuer || "", clientId: body.clientId || "", allowedDomain: body.allowedDomain! }); return Response.json({ sso }); }
  catch (error) { if (error instanceof Response) return error; throw error; }
}
