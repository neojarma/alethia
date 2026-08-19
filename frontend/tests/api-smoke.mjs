import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";

const base = "http://127.0.0.1:3100";
const dbPath = new URL("../data/alethia.json", import.meta.url);
const originalDb = await readFile(dbPath, "utf8");
const server = spawn("./node_modules/.bin/next", ["start", "-p", "3100"], {
  stdio: "ignore",
  env: {
    ...process.env,
    AUTH_SECRET: "qa-only-auth-secret-with-at-least-32-characters",
    ALLOWED_ORIGINS: "https://qa.example.test",
    ENABLE_DEMO_MODE: "true",
  },
});
const json = async (path, init) => {
  const response = await fetch(`${base}${path}`, init);
  const text = await response.text();
  assert.ok(text, `${path} returned an empty response (${response.status})`);
  return { response, body: JSON.parse(text) };
};
const cookiesFrom = (response) => {
  const values = response.headers.getSetCookie?.() || [response.headers.get("set-cookie")].filter(Boolean);
  return values.map((value) => value.split(";")[0]).join("; ");
};

try {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const health = await json("/api/health");
  assert.equal(health.response.status, 200);
  assert.equal(typeof health.body.health, "number");
  const allowedCors = await fetch(`${base}/api/health`, {
    headers: { origin: "https://qa.example.test" },
  });
  assert.equal(
    allowedCors.headers.get("access-control-allow-origin"),
    "https://qa.example.test",
  );
  const rejectedCors = await fetch(`${base}/api/health`, {
    headers: { origin: "https://untrusted.example.test" },
  });
  assert.equal(rejectedCors.headers.get("access-control-allow-origin"), null);
  const corsPreflight = await fetch(`${base}/api/health`, {
    method: "OPTIONS",
    headers: {
      origin: "https://qa.example.test",
      "access-control-request-method": "POST",
    },
  });
  assert.equal(corsPreflight.status, 204);
  assert.equal(
    corsPreflight.headers.get("access-control-allow-origin"),
    "https://qa.example.test",
  );
  const unauthenticatedSession = await json("/api/session");
  assert.equal(unauthenticatedSession.response.status, 401);
  const protectedWorkspace = await fetch(`${base}/workspace`, {
    redirect: "manual",
  });
  assert.equal(protectedWorkspace.status, 307);
  assert.equal(protectedWorkspace.headers.get("location"), "/login");
  const demoLogin = await json("/api/auth/demo", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ role: "developer" }),
  });
  assert.equal(demoLogin.body.role, "developer");
  const demoCookie = demoLogin.response.headers.get("set-cookie");
  assert.match(demoCookie, /alethia-demo-role=developer/);
  const cookieSession = await json("/api/session", {
    headers: { cookie: demoCookie },
  });
  assert.equal(cookieSession.body.user.name, "Dimas Nugroho");
  const headerCannotOverrideCookie = await json("/api/session", {
    headers: { cookie: demoCookie, "x-demo-role": "manager" },
  });
  assert.equal(headerCannotOverrideCookie.body.user.role, "developer");
  const invalidDemoLogin = await json("/api/auth/demo", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ role: "administrator" }),
  });
  assert.equal(invalidDemoLogin.response.status, 400);
  const session = await json("/api/session", {
    headers: { "x-demo-role": "employee" },
  });
  assert.equal(session.body.user.role, "employee");
  const developerSession = await json("/api/session", {
    headers: { "x-demo-role": "developer" },
  });
  assert.equal(developerSession.body.user.name, "Dimas Nugroho");
  assert.equal(developerSession.body.user.department, "Engineering");
  const employeePeopleDenied = await json("/api/people", {
    headers: { "x-demo-role": "employee" },
  });
  assert.equal(employeePeopleDenied.response.status, 403);
  const managerPeople = await json("/api/people", {
    headers: { "x-demo-role": "manager" },
  });
  assert.equal(managerPeople.body.users.length, 40);
  const demoWorkspacePeople = await json("/api/client/people", {
    headers: { "x-demo-role": "manager" },
  });
  assert.equal(demoWorkspacePeople.body.people.length, 40);
  const deniedUploadForm = new FormData();
  deniedUploadForm.set("title", "Denied upload");
  deniedUploadForm.set(
    "file",
    new Blob(["A sufficiently long document body for denied upload testing."], {
      type: "text/plain",
    }),
    "denied.txt",
  );
  const deniedAiWorkflow = await json("/api/workflows/analyze", {
    method: "POST",
    headers: { "x-demo-role": "employee" },
    body: deniedUploadForm,
  });
  assert.equal(deniedAiWorkflow.response.status, 403);
  const assistant = await json("/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "employee" },
    body: JSON.stringify({ query: "When is customer PII access reviewed?" }),
  });
  assert.equal(assistant.body.confidence, "high");
  assert.ok(assistant.body.citations.length > 0);
  const forbidden = await json("/api/documents", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "employee" },
    body: JSON.stringify({
      title: "Denied",
      version: "v1",
      content: "A document long enough to satisfy validation.",
    }),
  });
  assert.equal(forbidden.response.status, 403);
  const agent = await json("/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({ action: "run" }),
  });
  assert.equal(agent.response.status, 200);
  assert.equal(typeof agent.body.executed, "number");
  const event = await json("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "employee" },
    body: JSON.stringify({
      event: "demo.workflow.completed",
      metadata: { durationSeconds: 96 },
    }),
  });
  assert.equal(event.response.status, 202);
  const analytics = await json("/api/analytics", {
    headers: { "x-demo-role": "manager" },
  });
  assert.equal(analytics.body.totals["demo.workflow.completed"], 1);
  const resetForbidden = await json("/api/demo/reset", {
    method: "POST",
    headers: { "x-demo-role": "employee" },
  });
  assert.equal(resetForbidden.response.status, 403);
  const reset = await json("/api/demo/reset", {
    method: "POST",
    headers: { "x-demo-role": "manager" },
  });
  assert.equal(reset.body.reset, true);
  const developerAssistant = await json("/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "developer" },
    body: JSON.stringify({
      query: "Are static API keys allowed in repositories?",
    }),
  });
  assert.notEqual(developerAssistant.body.confidence, "insufficient");
  assert.match(
    developerAssistant.body.citations[0].title,
    /API Authentication/,
  );
  const employeeTechnicalDenied = await json("/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "employee" },
    body: JSON.stringify({
      query: "Are static API keys allowed in repositories?",
    }),
  });
  assert.equal(employeeTechnicalDenied.body.confidence, "insufficient");
  const developerCampaignDenied = await json("/api/campaigns", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "developer" },
    body: JSON.stringify({
      documentId: "doc-api-auth-v3",
      title: "Developer cannot manage",
      audience: 5,
      dueAt: "2026-08-30",
    }),
  });
  assert.equal(developerCampaignDenied.response.status, 403);
  const wrongVerification = await json("/api/verify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "employee" },
    body: JSON.stringify({ documentId: "doc-policy-v3", selected: 0 }),
  });
  assert.equal(wrongVerification.response.status, 200);
  assert.equal(wrongVerification.body.passed, false);
  assert.equal(wrongVerification.body.riskResolved, false);
  const invalidCampaign = await json("/api/campaigns", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({
      documentId: "doc-policy-v3",
      title: "Invalid",
      audience: -2,
      dueAt: "not-a-date",
    }),
  });
  assert.equal(invalidCampaign.response.status, 400);
  const rejectedApproval = await json("/api/workflows/analyze", {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({ documentId: "doc-policy-v3", decision: "rejected", comment: "QA approval gate" }),
  });
  assert.equal(rejectedApproval.body.analysis.approvalStatus, "rejected");
  const rejectedCampaign = await json("/api/campaigns", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({ documentId: "doc-policy-v3", title: "Must not publish", audience: 3, dueAt: "2026-09-30" }),
  });
  assert.equal(rejectedCampaign.response.status, 409);
  const approvedApproval = await json("/api/workflows/analyze", {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({ documentId: "doc-policy-v3", decision: "approved", comment: "Questions and citations reviewed" }),
  });
  assert.equal(approvedApproval.body.analysis.approvalStatus, "approved");
  const legalCampaign = await json("/api/campaigns", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "legal" },
    body: JSON.stringify({ documentId: "doc-policy-v3", title: "Legal readiness QA", audience: 2, dueAt: "2026-09-30" }),
  });
  assert.equal(legalCampaign.response.status, 201);
  const remediationCampaign = await json("/api/campaigns", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({ documentId: "doc-policy-v3", title: "Remediation QA", audience: 3, dueAt: "2026-09-30" }),
  });
  assert.equal(remediationCampaign.response.status, 201);
  assert.equal(remediationCampaign.body.campaign.targetUserIds.length, 3);
  const employeeAssignments = await json("/api/assignments", {
    headers: { "x-demo-role": "employee" },
  });
  const remediationAssignment = employeeAssignments.body.assignments.find(
    (item) => item.campaignId === remediationCampaign.body.campaign.id,
  );
  assert.ok(remediationAssignment);
  const unknownAssignment = await json("/api/verify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "employee" },
    body: JSON.stringify({
      assignmentId: "assignment-does-not-exist",
      documentId: "doc-policy-v3",
      answers: [0, 0, 0],
    }),
  });
  assert.equal(unknownAssignment.response.status, 404);
  const mismatchedAssignment = await json("/api/verify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "employee" },
    body: JSON.stringify({
      assignmentId: remediationAssignment.id,
      documentId: "doc-api-auth-v3",
      answers: [0, 0, 0],
    }),
  });
  assert.equal(mismatchedAssignment.response.status, 400);
  const incompleteAnswers = await json("/api/verify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "employee" },
    body: JSON.stringify({
      assignmentId: remediationAssignment.id,
      documentId: "doc-policy-v3",
      answers: [0],
    }),
  });
  assert.equal(incompleteAnswers.response.status, 400);
  const failedDynamicVerification = await json("/api/verify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "employee" },
    body: JSON.stringify({
      assignmentId: remediationAssignment.id,
      documentId: "doc-policy-v3",
      answers: [3, 3, 3],
    }),
  });
  assert.equal(failedDynamicVerification.body.passed, false);
  assert.ok(failedDynamicVerification.body.remediation.citations.length > 0);
  const remediatedAssignments = await json("/api/assignments", {
    headers: { "x-demo-role": "employee" },
  });
  assert.ok(
    remediatedAssignments.body.notifications.some(
      (item) =>
        item.assignmentId === remediationAssignment.id &&
        item.title === "Targeted remediation is ready" &&
        item.read === false,
    ),
  );
  const impactEvidence = await json("/api/impact-evidence", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({
      campaignId: remediationCampaign.body.campaign.id,
      baselineReadiness: 52,
      currentReadiness: 78,
      manualHoursBefore: 18,
      hoursWithAlethia: 4,
      risksClosed: 3,
      gapsDiscovered: 7,
      managerQuote: "The team can now prove who is ready.",
      managerName: "QA Manager",
      evidenceSource: "Measured pilot worksheet",
    }),
  });
  assert.equal(impactEvidence.response.status, 201);
  assert.equal(impactEvidence.body.evidence.currentReadiness, 78);
  const executiveReport = await fetch(`${base}/api/executive-report`, {
    headers: { "x-demo-role": "manager" },
  });
  assert.equal(executiveReport.status, 200);
  assert.match(executiveReport.headers.get("content-type"), /application\/pdf/);
  assert.ok((await executiveReport.arrayBuffer()).byteLength > 1000);
  const connector = await json("/api/connectors", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({
      type: "github",
      name: "Engineering Handbook",
      config: { repository: "alethia/handbook" },
    }),
  });
  assert.equal(connector.response.status, 201);
  const duplicateConnector = await json("/api/connectors", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({
      type: "github",
      name: "Duplicate",
      config: { repository: "alethia/duplicate" },
    }),
  });
  assert.equal(duplicateConnector.response.status, 409);
  const sync = await json("/api/connectors/sync", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "legal" },
    body: JSON.stringify({
      connectorId: connector.body.connector.id,
      items: [
        {
          externalId: "runbook",
          title: "Production Runbook",
          content:
            "Production incidents require notifying Security and the incident commander within thirty minutes.",
        },
      ],
    }),
  });
  assert.equal(sync.body.run.imported, 1);
  assert.equal(sync.body.run.updated, 0);
  const changedSync = await json("/api/connectors/sync", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "legal" },
    body: JSON.stringify({ connectorId: connector.body.connector.id, items: [{ externalId: "runbook", title: "Production Runbook", version: "v2.0", department: "Engineering", content: "Production incidents require notifying Security and Legal within thirty minutes. A rollback plan and immutable evidence are required before closure." }] }),
  });
  assert.equal(changedSync.body.run.updated, 1);
  assert.equal(changedSync.body.run.changesCreated, 1);
  const changes = await json("/api/change-intelligence", { headers: { "x-demo-role": "manager" } });
  assert.ok(changes.body.changes.length >= 1);
  const invalidChangeAction = await json("/api/change-intelligence", { method: "PUT", headers: { "content-type": "application/json", "x-demo-role": "manager" }, body: JSON.stringify({ id: changes.body.changes[0].id, action: "delete" }) });
  assert.equal(invalidChangeAction.response.status, 400);
  const launchedChange = await json("/api/change-intelligence", { method: "PUT", headers: { "content-type": "application/json", "x-demo-role": "manager" }, body: JSON.stringify({ id: changes.body.changes[0].id, action: "launch-reverification" }) });
  assert.equal(launchedChange.body.change.status, "campaign-created");
  const team = await json("/api/teams", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({
      name: "Platform",
      department: "Engineering",
      managerId: "u1",
      memberIds: ["u3"],
    }),
  });
  assert.equal(team.response.status, 201);
  const sso = await json("/api/sso", {
    method: "PUT",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({
      enabled: true,
      provider: "oidc",
      issuer: "https://identity.example.test",
      clientId: "alethia-web",
      allowedDomain: "alethia.id",
    }),
  });
  assert.equal(sso.body.sso.enabled, true);
  const advanced = await json("/api/analytics/advanced", {
    headers: { "x-demo-role": "manager" },
  });
  assert.ok(advanced.body.totals.documents >= 2);
  assert.ok(advanced.body.connectors.length >= 1);
  assert.equal(typeof advanced.body.roi.hoursSaved, "number");
  assert.equal(typeof advanced.body.roi.riskClosureRate, "number");
  const audit = await json("/api/governance/audits", {
    method: "POST",
    headers: { "x-demo-role": "legal" },
  });
  assert.ok(Array.isArray(audit.body.findings));
  const evaluation = await json("/api/governance/evaluations", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({ modelId: "model-grounded-v1" }),
  });
  assert.equal(evaluation.body.evaluation.passed, true);
  const deptAgent = await json("/api/department-agents", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({
      name: "Engineering readiness agent",
      department: "Engineering",
      actions: ["audit", "remind", "escalate"],
    }),
  });
  assert.equal(deptAgent.response.status, 201);
  const agentRun = await json("/api/department-agents", {
    method: "PUT",
    headers: { "content-type": "application/json", "x-demo-role": "legal" },
    body: JSON.stringify({ id: deptAgent.body.agent.id, run: true }),
  });
  assert.equal(typeof agentRun.body.actionsExecuted, "number");
  const organization = await json("/api/enterprise/organizations", {
    headers: { "x-demo-role": "manager", "x-organization-id": "org-alethia" },
  });
  assert.equal(organization.body.organization.id, "org-alethia");
  const billing = await json("/api/enterprise/billing", {
    headers: { "x-demo-role": "manager", "x-organization-id": "org-alethia" },
  });
  assert.equal(billing.body.withinQuota, true);
  const templates = await json("/api/enterprise/templates", {
    headers: { "x-demo-role": "legal" },
  });
  assert.equal(templates.body.templates.length, 4);
  const instantiated = await json("/api/enterprise/templates", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "manager" },
    body: JSON.stringify({ templateId: "template-fintech" }),
  });
  assert.equal(instantiated.body.documentBlueprints.length, 3);
  const admin = await json("/api/enterprise/admin", {
    headers: { "x-demo-role": "manager" },
  });
  assert.equal(admin.body.organization.id, "org-alethia");
  assert.ok(admin.body.security.governance.citationRequired);
  const governance = await json("/api/governance", { headers: { "x-demo-role": "manager" } });
  assert.ok(governance.body.decisions.length >= 1);
  const unknownTenant = await json("/api/enterprise/admin", {
    headers: { "x-demo-role": "manager", "x-organization-id": "org-missing" },
  });
  assert.equal(unknownTenant.response.status, 404);
  const auditExport = await fetch(`${base}/api/enterprise/audit-export`, {
    headers: { "x-demo-role": "legal" },
  });
  assert.equal(auditExport.status, 200);
  assert.match(await auditExport.text(), /id,actor,action/);
  const evidenceExport = await json("/api/enterprise/audit-export?format=json", { headers: { "x-demo-role": "legal" } });
  assert.equal(evidenceExport.body.schemaVersion, "1.0");
  assert.ok(Array.isArray(evidenceExport.body.aiDecisions));
  const stamp = Date.now();
  const clientAdminEmail = `qa-admin-${stamp}@example.test`;
  const invalidOnboarding = await json("/api/onboarding", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ companyName: "Invalid Tenant", adminName: "QA Admin", adminEmail: `invalid-${stamp}@example.test`, password: "StrongPass123!", divisions: ["Engineering"], people: [{ name: "No Password", email: `invalid-person-${stamp}@example.test`, division: "Engineering", functionalRole: "developer", accountRole: "member", password: "short" }] }),
  });
  assert.equal(invalidOnboarding.response.status, 400);
  const onboarding = await json("/api/onboarding", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      companyName: `QA Tenant ${stamp}`,
      adminName: "QA Admin",
      adminEmail: clientAdminEmail,
      password: "StrongPass123!",
      divisions: ["Engineering", "Legal"],
      people: [
        { name: "Tenant Developer", email: `qa-dev-${stamp}@example.test`, division: "Engineering", functionalRole: "developer", accountRole: "member", password: "StrongPass123!", title: "Engineer" },
        { name: "Tenant Counsel", email: `qa-legal-${stamp}@example.test`, division: "Legal", functionalRole: "legal", accountRole: "member", password: "StrongPass123!", title: "Counsel" },
      ],
    }),
  });
  assert.equal(onboarding.response.status, 201);
  assert.equal(onboarding.body.people, 3);
  const clientCookie = cookiesFrom(onboarding.response);
  assert.match(clientCookie, /alethia-session=/);
  const clientContext = await json("/api/client/context", { headers: { cookie: clientCookie } });
  assert.equal(clientContext.body.organization.name, `QA Tenant ${stamp}`);
  assert.equal(clientContext.body.user.email, clientAdminEmail);
  const clientPeople = await json("/api/client/people", { headers: { cookie: clientCookie } });
  assert.equal(clientPeople.body.people.length, 3);
  assert.ok(clientPeople.body.people.every((person) => !String(person.id).startsWith("u")));
  const clientDocuments = await json("/api/documents", { headers: { cookie: clientCookie } });
  assert.equal(clientDocuments.body.documents.length, 4);
  assert.ok(clientDocuments.body.documents.every((document) => document.hasGeneratedTest === true));
  const clientAdvanced = await json("/api/analytics/advanced", { headers: { cookie: clientCookie } });
  assert.equal(clientAdvanced.body.totals.people, 3);
  assert.equal(clientAdvanced.body.totals.documents, 4);
  assert.equal(clientAdvanced.body.connectors.length, 0);
  assert.equal(clientAdvanced.body.departments.length, 2);
  const clientCampaign = await json("/api/campaigns", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: clientCookie },
    body: JSON.stringify({ documentId: clientDocuments.body.documents[0].id, title: "Tenant launch readiness", audience: 3, dueAt: "2026-09-30" }),
  });
  assert.equal(clientCampaign.response.status, 201);
  assert.equal(clientCampaign.body.campaign.targetUserIds.length, 3);
  assert.ok(clientCampaign.body.campaign.targetUserIds.every((id) => !String(id).startsWith("u")));
  console.log(
    "API smoke tests passed across V1.1, V2, V3, and V4 enterprise workflows",
  );
} finally {
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await once(server, "exit");
  }
  await writeFile(dbPath, originalDb);
}
