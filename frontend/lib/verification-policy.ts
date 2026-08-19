import type { CampaignRecord } from "./domain";

export const defaultVerificationPolicy: NonNullable<CampaignRecord["policy"]> = {
  passingScore: 80,
  maxAttempts: 3,
  questionCount: 5,
  randomizeQuestions: true,
  certificationDays: 365,
  reminderDaysBefore: 2,
  escalateAfterDays: 1,
};

export function questionOrder(length: number, assignmentId: string, policy?: CampaignRecord["policy"]) {
  const resolved = { ...defaultVerificationPolicy, ...policy };
  const indexes = Array.from({ length }, (_, index) => index);
  if (resolved.randomizeQuestions) {
    let seed = [...assignmentId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    for (let index = indexes.length - 1; index > 0; index--) {
      seed = (seed * 9301 + 49297) % 233280;
      const target = Math.floor((seed / 233280) * (index + 1));
      [indexes[index], indexes[target]] = [indexes[target], indexes[index]];
    }
  }
  return indexes.slice(0, Math.min(resolved.questionCount, length));
}
