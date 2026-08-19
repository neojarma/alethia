import { requireRole } from "@/lib/auth";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) { try { requireRole(request, ["manager", "legal"]); const db = await readDb(); return Response.json({ teams: db.teams }); } catch (error) { if (error instanceof Response) return error; throw error; } }
export async function POST(request: Request) {
  try { requireRole(request, ["manager"]); const body = await request.json() as { name?: string; department?: string; managerId?: string; memberIds?: string[] }; if (!body.name || !body.department || !body.managerId) return Response.json({ error: "name, department and managerId are required" }, { status: 400 }); const team = await mutateDb(db => { const item = { id: `team-${Date.now()}`, name: body.name!, department: body.department!, managerId: body.managerId!, memberIds: body.memberIds || [] }; db.teams.push(item); return item; }); return Response.json({ team }, { status: 201 }); }
  catch (error) { if (error instanceof Response) return error; throw error; }
}
