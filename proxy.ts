import { NextRequest, NextResponse } from "next/server";

const roles = new Set(["manager", "employee", "developer", "legal"]);
const allowedOrigins = new Set([
  "https://beef-103-25-110-230.ngrok-free.app",
]);
const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Demo-Role, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
};
const publicApiRoutes = new Set([
  "/api/health",
  "/api/auth/demo",
  "/api/auth/client",
  "/api/auth/logout",
  "/api/onboarding",
]);

function withCors(response: NextResponse, origin: string) {
  if (allowedOrigins.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  Object.entries(corsHeaders).forEach(([key, value]) =>
    response.headers.set(key, value),
  );
  response.headers.append("Vary", "Origin");
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin") ?? "";

  if (request.method === "OPTIONS") {
    return withCors(new NextResponse(null, { status: 204 }), origin);
  }

  if (publicApiRoutes.has(pathname)) {
    return withCors(NextResponse.next(), origin);
  }

  const cookieRole = request.cookies.get("alethia-demo-role")?.value;
  const headerRole = request.headers.get("x-demo-role")?.toLowerCase();
  const authenticated =
    (cookieRole && roles.has(cookieRole)) ||
    (headerRole && roles.has(headerRole)) ||
    Boolean(request.cookies.get("alethia-session")?.value);

  if (authenticated) return withCors(NextResponse.next(), origin);
  if (pathname.startsWith("/api/")) {
    return withCors(
      NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
      origin,
    );
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/workspace/:path*", "/api/:path*"],
};
