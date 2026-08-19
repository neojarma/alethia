import test from "node:test";
import assert from "node:assert/strict";
import {
  answerQuestion,
  calculateHealth,
  chunkDocument,
  diffDocuments,
  retrieve,
  tokenize,
} from "../lib/knowledge-engine.ts";
import type { Database, StoredDocument } from "../lib/domain.ts";

const content =
  "Section 4.2\nCustomer PII access reviews are required every 90 days.\n\nIncident response\nNotify Security within 30 minutes.";
const document: StoredDocument = {
  id: "d1",
  title: "Data Policy",
  version: "v3",
  department: "Legal",
  access: ["manager", "employee", "developer", "legal"],
  content,
  chunks: chunkDocument(content),
  createdAt: "2026-08-18",
};

test("tokenization removes noise and duplicates", () =>
  assert.deepEqual(tokenize("The policy policy requires access review"), [
    "policy",
    "requires",
    "access",
    "review",
  ]));
test("documents are split into source-addressable chunks", () => {
  const chunks = chunkDocument(content);
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].section, "Section 4.2");
});
test("change detection classifies sensitive changes as critical", () => {
  const result = diffDocuments(
    "Reviews are annual.",
    "Customer PII reviews are required every 90 days.",
  );
  assert.equal(result.severity, "critical");
  assert.equal(result.meaningfulChanges, 1);
});
test("retrieval respects role permissions", () => {
  assert.equal(retrieve("PII access review", [document], "employee").length, 1);
  assert.equal(
    retrieve(
      "PII access review",
      [{ ...document, access: ["legal"] }],
      "employee",
    ).length,
    0,
  );
});
test("developer retrieves approved technical knowledge", () => {
  const technical = {
    ...document,
    id: "technical",
    title: "API Authentication",
    department: "Engineering",
    access: ["manager", "developer"] as StoredDocument["access"],
    content: "Static API keys are prohibited in repositories.",
    chunks: chunkDocument("Static API keys are prohibited in repositories."),
  };
  assert.equal(
    retrieve("static API keys repositories", [technical], "developer").length,
    1,
  );
  assert.equal(
    retrieve("static API keys repositories", [technical], "employee").length,
    0,
  );
});
test("grounded answers include citations", () => {
  const result = answerQuestion(
    "When is the PII access review?",
    [document],
    "manager",
  );
  assert.match(result.answer, /90 days/);
  assert.equal(result.citations[0].section, "Section 4.2");
});
test("insufficient evidence is explicit", () =>
  assert.equal(
    answerQuestion("office parking", [document], "manager").confidence,
    "insufficient",
  ));
test("a generic document word alone does not create false confidence", () =>
  assert.equal(
    answerQuestion("What is the office parking policy?", [document], "manager")
      .confidence,
    "insufficient",
  ));
test("health score is deterministic", () => {
  const db = {
    users: [{ verified: true }, { verified: false }],
    risks: [{ status: "resolved" }, { status: "open" }],
    campaigns: [{ status: "completed" }, { status: "active" }],
  } as unknown as Database;
  assert.equal(calculateHealth(db), 50);
});
