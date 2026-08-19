import { requireRole, getRole, getOrganizationId, getDivisionScope, getAccountRole } from "@/lib/auth";
import { chunkDocument, diffDocuments } from "@/lib/knowledge-engine";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) {
  const role = getRole(request); const db = await readDb();
  const organizationId=getOrganizationId(request); const divisionId=getDivisionScope(request);
  const clientRequest=Boolean(getAccountRole(request));
  return Response.json({ documents: db.documents.filter(d => d.access.includes(role) && (clientRequest ? d.organizationId===organizationId : (!d.organizationId || d.organizationId===organizationId)) && (!d.divisionId || !divisionId || d.divisionId===divisionId)).map(({ content, chunks, ...meta }) => ({ ...meta, excerpt: content.slice(0, 160), chunkCount: chunks.length, hasGeneratedTest: db.documentAnalyses.some((analysis) => analysis.documentId === meta.id && analysis.questions.length > 0 && analysis.approvalStatus === "approved") })) });
}

export async function POST(request: Request) {
  try {
    const role = requireRole(request, ["manager", "legal"]);
    const body = await request.json() as { title?: string; version?: string; department?: string; content?: string; previousContent?: string };
    if (!body.title || !body.version || !body.content || body.content.length < 20) return Response.json({ error: "title, version and document content are required" }, { status: 400 });
    const analysis = diffDocuments(body.previousContent || "", body.content);
    const document = await mutateDb(db => {
      const record = { id: `doc-${Date.now()}`, title: body.title!, version: body.version!, department: body.department || "General", access: ["manager", "employee", "developer", "legal"] as const, content: body.content!, chunks: chunkDocument(body.content!), organizationId:getOrganizationId(request), divisionId:getDivisionScope(request), createdAt: new Date().toISOString() };
      db.documents.push({ ...record, access: [...record.access] });
      db.audit.unshift({ id: `audit-${Date.now()}`, actor: role, action: "document.ingested", detail: `${record.title} ${record.version}: ${analysis.meaningfulChanges} meaningful changes`, createdAt: new Date().toISOString() });
      return record;
    });
    return Response.json({ document, analysis }, { status: 201 });
  } catch (error) { if (error instanceof Response) return error; throw error; }
}
