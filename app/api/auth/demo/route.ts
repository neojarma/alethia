import type { DemoRole } from "@/lib/domain";
import { NextResponse } from "next/server";
import { AUTH_CONTEXT_COOKIE, CLIENT_SESSION_COOKIE } from "@/lib/client-auth";

const roles: DemoRole[] = ["manager", "employee", "developer", "legal"];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    role?: string;
  } | null;
  const role = body?.role?.toLowerCase() as DemoRole | undefined;
  if (!role || !roles.includes(role)) {
    return Response.json(
      { error: "Select a valid demo role." },
      { status: 400 },
    );
  }
  const response = NextResponse.json({ authenticated: true, role });
  response.cookies.set("alethia-demo-role", role, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 28800 });
  response.cookies.delete(CLIENT_SESSION_COOKIE);
  response.cookies.delete(AUTH_CONTEXT_COOKIE);
  return response;
}
