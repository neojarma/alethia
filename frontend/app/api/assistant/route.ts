import { getAccountRole, getDivisionScope, getOrganizationId, getRole } from "@/lib/auth";
import { answerQuestion } from "@/lib/knowledge-engine";
import { mutateDb } from "@/lib/store";
import { createHash } from "node:crypto";

export async function POST(request: Request) {
  const role = getRole(request); const organizationId = getOrganizationId(request); const body = await request.json() as { query?: string };
  if (!body.query?.trim()) return Response.json({ error: "query is required" }, { status: 400 });
  const result = await mutateDb(db => {
    const divisionId=getDivisionScope(request); const clientRequest=Boolean(getAccountRole(request));
    const documents=db.documents.filter((document)=>(clientRequest ? document.organizationId===organizationId : (!document.organizationId||document.organizationId===organizationId))&&(!document.divisionId||!divisionId||document.divisionId===divisionId));
    const answer = answerQuestion(body.query!.trim(), documents, role);
    const confidenceScore = answer.confidence === "high" ? 0.96 : answer.confidence === "medium" ? 0.76 : 0.2;
    const decision = db.governance.blockBelowConfidence && confidenceScore < db.governance.minConfidence ? "blocked" as const : "allowed" as const;
    db.aiDecisionLogs.unshift({ id: `ai-decision-${Date.now()}`, action: "assistant.answer", provider: "local", model: "alethia-grounded-v1", confidence: confidenceScore, sources: answer.citations.map(citation => citation.title), promptHash: createHash("sha256").update(body.query!.trim()).digest("hex"), decision, approvedBy: null, createdAt: new Date().toISOString() });
    const usage = db.usage.find(item => item.organizationId === organizationId);
    if (usage) usage.queries += 1;
    db.audit.unshift({ id: `audit-assistant-${Date.now()}`, actor: role, action: "assistant.queried", detail: `${answer.confidence} confidence with ${answer.citations.length} citations`, createdAt: new Date().toISOString() });
    return { ...answer, governance: { decision, confidenceScore, citationRequired: db.governance.citationRequired } };
  });
  return Response.json(result);
}
