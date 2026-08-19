import "server-only";
import type { DemoRole, DocumentAnalysis } from "./domain";

const model = process.env.SUMOPOD_MODEL || "deepseek-v4-flash";
const baseUrl = process.env.SUMOPOD_BASE_URL || "https://ai.sumopod.com/v1";

function parseJson(content: string) {
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned) as Omit<
    DocumentAnalysis,
    "documentId" | "provider" | "model" | "createdAt"
  >;
}

export async function analyzeKnowledgeDocument(input: {
  title: string;
  department: string;
  content: string;
}) {
  const key = process.env.SUMOPOD_API_KEY;
  if (!key) throw new Error("SUMOPOD_API_KEY is not configured.");
  const prompt = `You are Alethia, an enterprise knowledge-readiness analyst. Analyze the approved document below and return ONLY valid JSON with this exact shape:
{"summary":"2-3 sentence summary","businessImpact":"clear business impact","keyChanges":["3-6 material requirements"],"affectedDepartments":["department names"],"affectedRoles":["manager|employee|developer|legal"],"questions":[{"scenario":"short workplace scenario","question":"one practical question","options":["four options"],"correctIndex":0,"explanation":"why correct","citation":"section or quoted heading"}]}
Generate exactly 3 questions. correctIndex is zero-based. Do not invent facts outside the document. Valid roles are manager, employee, developer, legal.

Title: ${input.title}
Owning department: ${input.department}
Document:
${input.content.slice(0, 24000)}`;
  let response: Response | undefined;
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 1800, temperature: 0.2 }),
        signal: AbortSignal.timeout(45000),
      });
      if (response.ok || (response.status < 500 && response.status !== 429)) break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!response) throw new Error(lastError instanceof Error ? `AI provider unavailable: ${lastError.message}` : "AI provider unavailable.");
  if (!response.ok) throw new Error(`AI provider failed (${response.status}).`);
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned no analysis.");
  const parsed = parseJson(content);
  parsed.affectedRoles = parsed.affectedRoles.filter((role) =>
    (["manager", "employee", "developer", "legal"] as DemoRole[]).includes(
      role,
    ),
  );
  if (
    parsed.questions?.length !== 3 ||
    parsed.questions.some((q) => !q.question || !q.scenario || !q.citation || q.options.length !== 4 || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3)
  )
    throw new Error("AI provider returned an invalid knowledge test.");
  return { ...parsed, provider: "Sumopod", model };
}
