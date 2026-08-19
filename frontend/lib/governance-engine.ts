import type { Database } from "./domain";
import { answerQuestion } from "./knowledge-engine.ts";

export function runKnowledgeAudit(db: Database) {
  const findings: Database["governanceFindings"] = [];
  const seen = new Map<string, typeof db.documents[number]>();
  for (const document of db.documents) {
    const key = document.title.toLowerCase(); const prior = seen.get(key);
    if (prior && prior.version !== document.version) findings.push({ id: `finding-conflict-${document.id}`, type: "conflict", severity: "high", title: `Multiple active versions: ${document.title}`, detail: `${prior.version} and ${document.version} are both retrievable.`, status: "open", createdAt: new Date().toISOString() });
    seen.set(key, document);
    if (!document.chunks.length) findings.push({ id: `finding-citation-${document.id}`, type: "missing-citation", severity: "critical", title: `No source chunks: ${document.title}`, detail: "The document cannot support cited answers.", status: "open", createdAt: new Date().toISOString() });
  }
  const sensitive = db.users.filter(u => u.sensitiveAccess && !u.verified);
  if (sensitive.length) findings.push({ id: "finding-sensitive-access", type: "access", severity: "critical", title: `${sensitive.length} sensitive-access users are unverified`, detail: sensitive.map(u => u.name).join(", "), status: "open", createdAt: new Date().toISOString() });
  return findings;
}

export function evaluateModel(db: Database, modelId: string) {
  const cases = [
    ["When must PII access be reviewed?", /90 days/i],
    ["Who must be notified within 30 minutes?", /Security and Legal/i],
    ["What is the office parking policy?", /insufficient/i],
  ] as const;
  const results = cases.map(([query, expected]) => { const result = answerQuestion(query, db.documents, "manager"); const combined = `${result.answer} ${result.confidence}`; return { query, passed: expected.test(combined), citations: result.citations.length }; });
  const score = Math.round(results.filter(r => r.passed).length / results.length * 100);
  return { modelId, score, passed: score >= 80, cases: results };
}
