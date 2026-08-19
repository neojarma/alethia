import { NextResponse } from "next/server";
import { AUTH_CONTEXT_COOKIE, CLIENT_SESSION_COOKIE, createSessionToken, hashPassword, hashToken, signAuthContext } from "@/lib/client-auth";
import { chunkDocument } from "@/lib/knowledge-engine";
import { mutateDb } from "@/lib/store";
import type { DemoRole } from "@/lib/domain";

const validRoles = new Set(["manager", "employee", "developer", "legal"]);
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const companyName = String(body.companyName || "").trim();
  const adminName = String(body.adminName || "").trim();
  const adminEmail = String(body.adminEmail || "").trim().toLowerCase();
  const password = String(body.password || "");
  const divisionNames: string[] = Array.isArray(body.divisions) ? body.divisions.map((value: unknown) => String(value).trim()).filter(Boolean) : [];
  const people: {name?:string;email?:string;division?:string;functionalRole?:string;accountRole?:string;password?:string;title?:string}[] = Array.isArray(body.people) ? body.people : [];
  if (!companyName || !adminName || !/^\S+@\S+\.\S+$/.test(adminEmail) || password.length < 8 || !divisionNames.length) {
    return NextResponse.json({ error: "Complete the company, admin, password and at least one division." }, { status: 400 });
  }
  const peopleEmails = people.map((person) => String(person.email || "").trim().toLowerCase());
  const invalidPerson = people.some((person, index) =>
    !String(person.name || "").trim() ||
    !/^\S+@\S+\.\S+$/.test(peopleEmails[index]) ||
    String(person.password || "").length < 8 ||
    !divisionNames.includes(String(person.division || "")) ||
    !validRoles.has(String(person.functionalRole || "")) ||
    !["manager", "member"].includes(String(person.accountRole || "")),
  );
  if (invalidPerson || new Set([adminEmail, ...peopleEmails]).size !== peopleEmails.length + 1) {
    return NextResponse.json({ error: "Every person needs a unique work email, valid division, role and password of at least 8 characters." }, { status: 400 });
  }
  const token = createSessionToken();
  try {
    const result = await mutateDb((db) => {
      if (db.clientAccounts.some((item) => item.email.toLowerCase() === adminEmail)) throw new Error("An account with this email already exists.");
      const now = new Date().toISOString();
      const organizationId = `org-${crypto.randomUUID()}`;
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      db.organizations.push({ id: organizationId, name: companyName, slug: `${slug}-${organizationId.slice(-6)}`, status: "active", createdAt: now });
      const divisions = divisionNames.map((name: string) => ({ id: `div-${crypto.randomUUID()}`, organizationId, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), description: `${name} knowledge and readiness workspace.`, createdAt: now }));
      db.divisions.push(...divisions);
      const adminId = `ca-${crypto.randomUUID()}`;
      db.clientAccounts.push({ id: adminId, organizationId, divisionId: null, name: adminName, email: adminEmail, passwordHash: hashPassword(password), accountRole: "org_admin", functionalRole: "manager", title: "Organization administrator", status: "active", createdAt: now });
      let createdPeople = 0;
      for (const person of people) {
        const email = String(person.email || "").trim().toLowerCase();
        const division = divisions.find((item) => item.name === person.division);
        const role = person.functionalRole && validRoles.has(person.functionalRole) ? person.functionalRole as DemoRole : "employee";
        if (!email || !division || db.clientAccounts.some((item) => item.email.toLowerCase() === email)) continue;
        db.clientAccounts.push({ id: `ca-${crypto.randomUUID()}`, organizationId, divisionId: division.id, name: String(person.name).trim(), email, passwordHash: hashPassword(String(person.password)), accountRole: person.accountRole === "manager" ? "manager" : "member", functionalRole: role, title: String(person.title || role), status: "active", createdAt: now });
        createdPeople += 1;
      }
      const engineering = divisions.find((item) => /engineer|develop|technology/i.test(item.name));
      const legal = divisions.find((item) => /legal|compliance|risk/i.test(item.name));
      const support = divisions.find((item) => /support|success|service/i.test(item.name));
      const operations = divisions.find((item) => /operation|delivery|finance/i.test(item.name));
      const samples = [
        { title: "Platform Architecture & Local Development", department: engineering?.name || divisions[0].name, divisionId: engineering?.id || divisions[0].id, content: "Section 1 · Architecture\nThe application uses a web client, authenticated API boundary and tenant-scoped knowledge store. Every request must resolve organization and division scope before data access.\n\nSection 2 · Developer setup\nInstall dependencies, configure environment variables, run the application locally and verify health before opening a pull request. Secrets must never be committed.\n\nSection 3 · Delivery\nChanges require automated tests, peer review, security checks and a documented rollback path before production deployment." },
        { title: "Incident Response Playbook", department: engineering?.name || divisions[0].name, divisionId: engineering?.id || divisions[0].id, content: "Section 1 · Detect and contain\nAcknowledge critical incidents within ten minutes, name an incident commander and preserve evidence.\n\nSection 2 · Communicate\nNotify Security, Legal and affected business owners using the approved incident channel.\n\nSection 3 · Recover and learn\nValidate service health, record the timeline and publish corrective actions with owners and due dates." },
        { title: "Company Data Handling Policy", department: "Company-wide", divisionId: null, content: "Section 1 · Purpose\nCustomer and employee data is accessed only for approved business purposes.\n\nSection 2 · Access\nUse least privilege, review access quarterly and remove access promptly when responsibilities change.\n\nSection 3 · Reporting\nSuspected exposure must be reported to Security and Legal immediately." },
        ...(legal ? [{ title:"Policy Lifecycle & Evidence Standard", department:legal.name, divisionId:legal.id, content:"Section 1 · Policy lifecycle\nDraft, review, approve and publish controlled policies with effective dates and version history.\n\nSection 2 · Evidence\nRetain every material interpretation, source, approver and affected audience for audit readiness." }] : []),
        ...(support ? [{ title:"Customer Support Trusted Answer Playbook", department:support.name, divisionId:support.id, content:"Section 1 · Trusted answers\nAnswer from an approved current source and cite the relevant section when customer data is involved.\n\nSection 2 · Escalation\nEscalate privacy, security and contractual issues. State when evidence is insufficient rather than guessing." }] : []),
        ...(operations ? [{ title:"Operations Change Readiness SOP", department:operations.name, divisionId:operations.id, content:"Section 1 · Daily controls\nReview exceptions, confirm handoffs and record material decisions.\n\nSection 2 · Change readiness\nMaterial SOP changes require owner approval, targeted learning and verification before the effective date." }] : []),
      ];
      const seededDocuments = samples.map((doc) => ({ id: `doc-${crypto.randomUUID()}`, title: doc.title, version: "v1.0", department: doc.department, access: ["manager", "employee", "developer", "legal"] as DemoRole[], content: doc.content, chunks: chunkDocument(doc.content), organizationId, divisionId: doc.divisionId, createdAt: now }));
      db.documents.push(...seededDocuments);
      db.documentAnalyses.push(...seededDocuments.map((doc) => ({ documentId:doc.id, summary:`Understand and apply ${doc.title}.`, businessImpact:"Verified understanding reduces operational errors and creates auditable readiness evidence.", keyChanges:["Follow the approved workflow","Escalate when evidence is insufficient"], affectedDepartments:[doc.department], affectedRoles:doc.access, provider:"Alethia showcase", model:"grounded-seed-v1", approvalStatus:"approved" as const, approvedBy:adminId, approvedAt:now, approvalComment:"Approved starter content for the client workspace.", createdAt:now, questions:[
        {question:`Which source should guide work covered by ${doc.title}?`,scenario:"You need to make a material decision.",options:["The current approved document","A colleague's memory","An old message","An unverified public answer"],correctIndex:0,explanation:"Use the current approved source.",citation:"Section 1"},
        {question:"What should you do when the available evidence is insufficient?",scenario:"The document does not support a confident answer.",options:["Guess","Escalate to the named owner","Ignore the issue","Use an outdated version"],correctIndex:1,explanation:"Escalation preserves accuracy and accountability.",citation:"Section 2"},
        {question:"Why is verification recorded?",scenario:"A material process has changed.",options:["For decoration","To replace the source","To create readiness evidence","To remove manager ownership"],correctIndex:2,explanation:"Verification turns distribution into measurable understanding.",citation:"Section 3"},
      ] })));
      db.subscriptions.push({ organizationId, plan: "enterprise", status: "trial", seats: 100, renewalAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) });
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
      db.clientSessions.push({ id: crypto.randomUUID(), userId: adminId, tokenHash: hashToken(token), expiresAt, createdAt: now });
      return { organizationId, adminId, divisions: divisions.length, people: 1 + createdPeople };
    });
    const response = NextResponse.json(result, { status: 201 });
    response.cookies.set(CLIENT_SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60 });
    response.cookies.set(AUTH_CONTEXT_COOKIE, signAuthContext({ userId: result.adminId, organizationId: result.organizationId, divisionId: null, accountRole: "org_admin", functionalRole: "manager" }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60 });
    response.cookies.delete("alethia-demo-role");
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create workspace." }, { status: 409 });
  }
}
