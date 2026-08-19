import "server-only";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { AccountRole, DemoRole } from "./domain";
import { readDb } from "./store";

export const CLIENT_SESSION_COOKIE = "alethia-session";
export const AUTH_CONTEXT_COOKIE = "alethia-auth-context";
type AuthContext = { userId: string; organizationId: string; divisionId: string | null; accountRole: AccountRole; functionalRole: DemoRole };
const authSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured in production.");
  }
  return "alethia-local-development-secret-change-in-production";
};
export function signAuthContext(context: AuthContext) {
  const payload = Buffer.from(JSON.stringify(context)).toString("base64url");
  const signature = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
export function readAuthContext(cookieHeader: string | null): AuthContext | null {
  const value = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${AUTH_CONTEXT_COOKIE}=([^;]+)`))?.[1];
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()) as AuthContext; } catch { return null; }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getClientSession(token?: string) {
  if (!token) return null;
  const db = await readDb();
  const session = db.clientSessions.find((item) => item.tokenHash === hashToken(token) && new Date(item.expiresAt) > new Date());
  if (!session) return null;
  const user = db.clientAccounts.find((item) => item.id === session.userId && item.status === "active");
  if (!user) return null;
  const organization = db.organizations.find((item) => item.id === user.organizationId);
  const division = db.divisions.find((item) => item.id === user.divisionId) || null;
  return { user, organization, division };
}
