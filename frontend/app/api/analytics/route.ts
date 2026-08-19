import { getRole, requireRole } from "@/lib/auth";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) {
  try { requireRole(request, ["manager", "legal"]); const db = await readDb(); const totals = db.analytics.reduce<Record<string, number>>((acc, item) => { acc[item.event] = (acc[item.event] || 0) + 1; return acc; }, {}); return Response.json({ totals, recent: db.analytics.slice(-50).reverse() }); }
  catch (error) { if (error instanceof Response) return error; throw error; }
}
export async function POST(request: Request) {
  const role = getRole(request); const body = await request.json() as { event?: string; metadata?: Record<string, string | number | boolean> };
  if (!body.event || !/^[a-z0-9._-]{2,60}$/i.test(body.event)) return Response.json({ error: "valid event is required" }, { status: 400 });
  await mutateDb(db => db.analytics.push({ id: `event-${Date.now()}`, event: body.event!, role, metadata: body.metadata || {}, createdAt: new Date().toISOString() }));
  return Response.json({ accepted: true }, { status: 202 });
}
