import { requireRole } from "@/lib/auth";
import { mutateDb } from "@/lib/store";

export async function POST(request: Request) {
  try {
    requireRole(request, ["manager", "legal"]); const body = await request.json() as { action?: "run" };
    if (body.action !== "run") return Response.json({ error: "action must be run" }, { status: 400 });
    const tasks = await mutateDb(db => {
      const now = new Date().toISOString(); const open = db.risks.filter(r => r.status === "open");
      const created = open.map((risk, i) => ({ id: `agent-${Date.now()}-${i}`, type: risk.severity === "critical" ? "manager-escalation" : "reminder", status: "sent" as const, detail: `Follow-up created for ${risk.title}`, createdAt: now }));
      db.agentTasks.push(...created); created.forEach(task => db.audit.unshift({ id: `audit-${task.id}`, actor: "agent", action: task.type, detail: task.detail, createdAt: now })); return created;
    }); return Response.json({ executed: tasks.length, tasks });
  } catch (error) { if (error instanceof Response) return error; throw error; }
}
