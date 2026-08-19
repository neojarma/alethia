import test from "node:test";
import assert from "node:assert/strict";
import { getEntitlements, planLimits, toAuditCsv } from "../lib/enterprise.ts";
import type { Database } from "../lib/domain.ts";

test("plans expose increasing enterprise quotas",()=>{assert.ok(planLimits.enterprise.documents>planLimits.business.documents);assert.ok(planLimits.business.seats>planLimits.starter.seats);});
test("entitlements isolate usage by organization",()=>{const db={subscriptions:[{organizationId:"a",plan:"starter",status:"active",seats:5,renewalAt:"x"}],usage:[{organizationId:"a",documents:2,queries:3,seats:4,syncs:1},{organizationId:"b",documents:999,queries:999,seats:999,syncs:9}],featureFlags:[{organizationId:"a",key:"audit",enabled:true}]} as unknown as Database;const result=getEntitlements(db,"a")!;assert.equal(result.usage.documents,2);assert.equal(result.withinQuota,true);assert.equal(result.features.length,1);});
test("audit CSV escapes commas and quotes",()=>{const db={audit:[{id:"1",actor:"agent",action:"test",detail:'value, with "quote"',createdAt:"now",organizationId:"org-alethia"}]} as unknown as Database;const csv=toAuditCsv(db);assert.match(csv,/"value, with ""quote"""/);});
test("audit CSV excludes other organizations",()=>{const db={audit:[{id:"1",actor:"a",action:"test",detail:"allowed",createdAt:"now",organizationId:"a"},{id:"2",actor:"b",action:"test",detail:"secret",createdAt:"now",organizationId:"b"}]} as unknown as Database;const csv=toAuditCsv(db,"a");assert.match(csv,/allowed/);assert.doesNotMatch(csv,/secret/);});
