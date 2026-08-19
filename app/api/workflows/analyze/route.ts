import { getDivisionScope, getOrganizationId, requireRole } from "@/lib/auth";
import { analyzeKnowledgeDocument } from "@/lib/ai-provider";
import { extractDocumentText } from "@/lib/document-extractor";
import { chunkDocument } from "@/lib/knowledge-engine";
import { mutateDb } from "@/lib/store";
import type { DemoRole } from "@/lib/domain";
import { createHash } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const role = requireRole(request, ["manager"]);
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") || "").trim();
    const version = String(form.get("version") || "v1.0").trim();
    const department = String(form.get("department") || "General").trim();
    if (!(file instanceof File) || !title)
      return Response.json(
        { error: "Document file and title are required." },
        { status: 400 },
      );
    if (file.size > 10 * 1024 * 1024)
      return Response.json(
        { error: "Document must be 10 MB or smaller." },
        { status: 400 },
      );
    const content = await extractDocumentText(file);
    if (content.length < 80)
      return Response.json(
        { error: "The document does not contain enough readable text." },
        { status: 400 },
      );
    const ai = await analyzeKnowledgeDocument({ title, department, content });
    const result = await mutateDb((db) => {
      const documentId = `doc-${Date.now()}`;
      const document = {
        id: documentId,
        title,
        version,
        department,
        access: (["manager", ...ai.affectedRoles] as DemoRole[]).filter(
          (value, index, list) => list.indexOf(value) === index,
        ),
        content,
        chunks: chunkDocument(content),
        organizationId: getOrganizationId(request),
        divisionId: getDivisionScope(request),
        createdAt: new Date().toISOString(),
      };
      const analysis = {
        ...ai,
        documentId,
        createdAt: new Date().toISOString(),
        approvalStatus: "pending_review" as const,
        approvedBy: null,
        approvedAt: null,
        approvalComment: "",
      };
      db.documents.push(document);
      db.documentAnalyses.push(analysis);
      const needsApproval = db.governance.humanApprovalForCritical && ai.keyChanges.some((change) => /must|required|prohibited|incident|security|legal/i.test(change));
      db.aiDecisionLogs.unshift({ id: `ai-decision-${Date.now()}`, action: "document.analysis", provider: ai.provider, model: ai.model, confidence: 0.9, sources: ai.questions.map((question) => question.citation), promptHash: createHash("sha256").update(`${title}:${content}`).digest("hex"), decision: needsApproval ? "needs-approval" : "allowed", approvedBy: null, createdAt: new Date().toISOString() });
      db.audit.unshift({
        id: `audit-${Date.now()}`,
        actor: role,
        action: "document.ai-analyzed",
        detail: `${title} analyzed with ${ai.model}; ${ai.questions.length} verification questions generated`,
        createdAt: new Date().toISOString(),
      });
      return {
        document: { ...document, content: undefined, chunks: undefined },
        analysis,
      };
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: error instanceof Error ? error.message : "Analysis failed." },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const role = requireRole(request, ["manager", "legal"]);
    const body = (await request.json()) as {
      documentId?: string;
      decision?: "approved" | "rejected";
      comment?: string;
    };
    if (!body.documentId || !["approved", "rejected"].includes(body.decision || ""))
      return Response.json(
        { error: "documentId and a valid approval decision are required." },
        { status: 400 },
      );
    const organizationId = getOrganizationId(request);
    const result = await mutateDb((db) => {
      const document = db.documents.find(
        (item) =>
          item.id === body.documentId &&
          (!item.organizationId || item.organizationId === organizationId),
      );
      const analysis = db.documentAnalyses.find(
        (item) => item.documentId === body.documentId,
      );
      if (!document || !analysis) return null;
      analysis.approvalStatus = body.decision!;
      analysis.approvedBy = role;
      analysis.approvedAt = new Date().toISOString();
      analysis.approvalComment = String(body.comment || "").trim();
      db.aiDecisionLogs
        .filter(
          (entry) =>
            entry.action === "document.analysis" &&
            entry.decision === "needs-approval" &&
            entry.sources.some((source) =>
              analysis.questions.some((question) => question.citation === source),
            ),
        )
        .forEach((entry) => {
          entry.decision = body.decision === "approved" ? "allowed" : "blocked";
          entry.approvedBy = role;
        });
      db.audit.unshift({
        id: `audit-${Date.now()}`,
        actor: role,
        action: `document.analysis-${body.decision}`,
        detail: `${document.title} questions ${body.decision}${analysis.approvalComment ? `: ${analysis.approvalComment}` : ""}`,
        createdAt: new Date().toISOString(),
        organizationId,
      });
      return analysis;
    });
    if (!result)
      return Response.json({ error: "Analysis was not found." }, { status: 404 });
    return Response.json({ analysis: result });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: error instanceof Error ? error.message : "Approval failed." },
      { status: 500 },
    );
  }
}
