import type { Database, DemoRole, StoredDocument } from "./domain";

const stop = new Set(["the", "and", "for", "with", "that", "this", "from", "into", "what", "who", "needs", "show"]);

export function tokenize(text: string) {
  return [...new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(x => x.length > 2 && !stop.has(x)))];
}

export function chunkDocument(content: string) {
  const blocks = content.split(/\n{2,}/).map(x => x.trim()).filter(Boolean);
  return blocks.map((block, index) => {
    const lines = block.split("\n");
    const section = lines.length > 1 && lines[0].length < 90 ? lines.shift()! : `Section ${index + 1}`;
    const body = lines.join(" ") || block;
    return { section, content: body, tokens: tokenize(`${section} ${body}`) };
  });
}

export function diffDocuments(previous: string, current: string) {
  const oldParts = previous.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
  const newParts = current.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
  const removed = oldParts.filter(x => !newParts.includes(x));
  const added = newParts.filter(x => !oldParts.includes(x));
  const severity = /customer|pii|security|incident|privileged|regulatory/i.test(added.join(" ")) ? "critical" : added.length > 2 ? "high" : "medium";
  return { added, removed, severity, meaningfulChanges: Math.max(added.length, removed.length) };
}

export function retrieve(query: string, documents: StoredDocument[], role: DemoRole, limit = 3) {
  const queryTokens = tokenize(query);
  return documents.filter(d => d.access.includes(role)).flatMap(document => document.chunks.map(chunk => {
    const overlap = chunk.tokens.filter(token => queryTokens.includes(token)).length;
    const phraseBonus = queryTokens.some(token => chunk.content.toLowerCase().includes(token)) ? 1 : 0;
    return { document, chunk, score: overlap * 2 + phraseBonus };
  })).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

export function answerQuestion(query: string, documents: StoredDocument[], role: DemoRole) {
  const matches = retrieve(query, documents, role);
  if (!matches.length || matches[0].score < 4) return { answer: "I could not find sufficient approved evidence for that question.", citations: [], confidence: "insufficient" };
  const lead = matches[0];
  return {
    answer: lead.chunk.content,
    citations: matches.map(x => ({ documentId: x.document.id, title: x.document.title, version: x.document.version, section: x.chunk.section, excerpt: x.chunk.content.slice(0, 180), score: x.score })),
    confidence: matches[0].score >= 5 ? "high" : "moderate",
  };
}

export function calculateHealth(db: Database) {
  const verified = db.users.filter(u => u.verified).length / Math.max(db.users.length, 1);
  const resolved = db.risks.filter(r => r.status === "resolved").length / Math.max(db.risks.length, 1);
  const completed = db.campaigns.filter(c => c.status === "completed").length / Math.max(db.campaigns.length, 1);
  return Math.round((verified * .45 + resolved * .3 + completed * .25) * 100);
}
