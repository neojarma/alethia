import test from "node:test";
import assert from "node:assert/strict";
import { evaluateModel, runKnowledgeAudit } from "../lib/governance-engine.ts";
import { chunkDocument } from "../lib/knowledge-engine.ts";
import type { Database } from "../lib/domain.ts";

const content = "Section 4.2\nCustomer PII access reviews are required every 90 days.\n\nSection 6.1\nNotify Security and Legal within 30 minutes.";
const db = { documents:[{id:"d",title:"Policy",version:"v3",department:"Legal",access:["manager","employee","legal"],content,chunks:chunkDocument(content),createdAt:"now"}], users:[{name:"Ada",sensitiveAccess:true,verified:false}], risks:[], campaigns:[] } as unknown as Database;
test("continuous audit identifies unverified sensitive access",()=>{const findings=runKnowledgeAudit(db);assert.equal(findings[0].type,"access");assert.equal(findings[0].severity,"critical");});
test("model evaluation requires grounded answers and abstention",()=>{const result=evaluateModel(db,"model");assert.equal(result.score,100);assert.equal(result.passed,true);});
