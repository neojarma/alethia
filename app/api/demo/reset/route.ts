import { requireRole } from "@/lib/auth";
import { readAuthContext } from "@/lib/client-auth";
import { resetDb } from "@/lib/store";

export async function POST(request: Request) {
  if (readAuthContext(request.headers.get("cookie"))) return Response.json({ error: "Demo-only operation" }, { status: 403 });
  try { requireRole(request, ["manager"]); const db = await resetDb(); return Response.json({ reset: true, counts: { users: db.users.length, documents: db.documents.length, campaigns: db.campaigns.length, risks: db.risks.length } }); }
  catch (error) { if (error instanceof Response) return error; throw error; }
}
