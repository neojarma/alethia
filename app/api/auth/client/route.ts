import { NextResponse } from "next/server";
import { AUTH_CONTEXT_COOKIE, CLIENT_SESSION_COOKIE, createSessionToken, hashToken, signAuthContext, verifyPassword } from "@/lib/client-auth";
import { mutateDb } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  const token = createSessionToken();
  const result = await mutateDb((db) => {
    const user = db.clientAccounts.find((item) => item.email.toLowerCase() === email && item.status === "active");
    if (!user || !verifyPassword(password, user.passwordHash)) return null;
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    db.clientSessions = db.clientSessions.filter((item) => new Date(item.expiresAt) > new Date());
    db.clientSessions.push({ id: crypto.randomUUID(), userId: user.id, tokenHash: hashToken(token), expiresAt, createdAt: new Date().toISOString() });
    return { user, expiresAt };
  });
  if (!result) return NextResponse.json({ error: "The email or password is incorrect." }, { status: 401 });
  const response = NextResponse.json({ user: { name: result.user.name, role: result.user.accountRole }, expiresAt: result.expiresAt });
  response.cookies.set(CLIENT_SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60 });
  response.cookies.set(AUTH_CONTEXT_COOKIE, signAuthContext({ userId: result.user.id, organizationId: result.user.organizationId, divisionId: result.user.divisionId, accountRole: result.user.accountRole, functionalRole: result.user.functionalRole }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60 });
  response.cookies.delete("alethia-demo-role");
  return response;
}
