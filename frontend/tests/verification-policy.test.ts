import test from "node:test";
import assert from "node:assert/strict";
import { questionOrder } from "../lib/verification-policy.ts";

test("question order is deterministic, bounded, and configurable", () => {
  const policy = { passingScore: 90, maxAttempts: 2, questionCount: 3, randomizeQuestions: true, certificationDays: 180, reminderDaysBefore: 2, escalateAfterDays: 1 };
  const first = questionOrder(8, "assignment-42", policy);
  const second = questionOrder(8, "assignment-42", policy);
  assert.deepEqual(first, second);
  assert.equal(first.length, 3);
  assert.equal(new Set(first).size, 3);
});

test("question order remains sequential when randomization is disabled", () => {
  const policy = { passingScore: 80, maxAttempts: 3, questionCount: 2, randomizeQuestions: false, certificationDays: 365, reminderDaysBefore: 2, escalateAfterDays: 1 };
  assert.deepEqual(questionOrder(5, "assignment", policy), [0, 1]);
});
