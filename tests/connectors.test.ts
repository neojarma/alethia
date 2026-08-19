import test from "node:test";
import assert from "node:assert/strict";
import { normalizeConnectorItems, validateConnectorConfig } from "../lib/connectors.ts";

test("each connector validates its required scope", () => {
  assert.equal(validateConnectorConfig("google-drive", { folderId: "folder-1" }).valid, true);
  assert.deepEqual(validateConnectorConfig("github", {}).missing, ["repository"]);
  assert.equal(validateConnectorConfig("notion", { databaseId: "db-1" }).valid, true);
  assert.equal(validateConnectorConfig("jira", { projectKey: "OPS" }).valid, true);
});
test("connector payloads normalize into indexed documents", () => {
  const items = normalizeConnectorItems("github", [{ externalId: "readme", title: "Runbook", content: "Incident response requires notifying Security within thirty minutes." }]);
  assert.equal(items[0].department, "Engineering"); assert.ok(items[0].chunks.length > 0);
});
test("invalid short connector items are discarded", () => assert.equal(normalizeConnectorItems("jira", [{ externalId: "x", title: "Tiny", content: "short" }]).length, 0));
