import type { Database } from "./domain";

export const planLimits = { starter: { seats: 25, documents: 250, queries: 2500 }, business: { seats: 250, documents: 5000, queries: 50000 }, enterprise: { seats: 10000, documents: 1000000, queries: 10000000 } } as const;
export function getEntitlements(db: Database, organizationId: string) {
  const subscription = db.subscriptions.find(x => x.organizationId === organizationId); if (!subscription) return null;
  const usage = db.usage.find(x => x.organizationId === organizationId) || { organizationId, documents: 0, queries: 0, seats: 0, syncs: 0 };
  const limits = planLimits[subscription.plan]; return { subscription, usage, limits, withinQuota: usage.seats <= limits.seats && usage.documents <= limits.documents && usage.queries <= limits.queries, features: db.featureFlags.filter(x => x.organizationId === organizationId) };
}
export function toAuditCsv(db: Database, organizationId = "org-alethia") {
  const escape = (value: string) => `"${value.replaceAll('"','""')}"`;
  return ["id,actor,action,detail,createdAt", ...db.audit.filter(x => x.organizationId === organizationId).map(x => [x.id,x.actor,x.action,x.detail,x.createdAt].map(v => escape(String(v))).join(","))].join("\n");
}
