import { requireRole } from "@/lib/auth";
import { readDb } from "@/lib/store";

export async function GET(request: Request) {
  try {
    requireRole(request, ["manager", "legal"]);
    const db = await readDb();
    return Response.json({
      users: db.users.map(({ sensitiveAccess, verified, ...user }) => ({
        ...user,
        sensitiveAccess,
        verified,
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
