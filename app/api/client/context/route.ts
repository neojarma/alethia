import { NextResponse } from "next/server";
import { getClientSession, CLIENT_SESSION_COOKIE } from "@/lib/client-auth";

export async function GET(request: Request) {
  const token = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${CLIENT_SESSION_COOKIE}=([^;]+)`))?.[1];
  const context = await getClientSession(token);
  if (!context) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { passwordHash: _, ...user } = context.user;
  void _;
  return NextResponse.json({ user, organization: context.organization, division: context.division });
}
