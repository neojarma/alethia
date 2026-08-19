import { getRole } from "@/lib/auth";

export async function GET(request: Request) {
  const role = getRole(request);
  const profiles = {
    manager: { id: "u1", name: "Maya Putri", role, department: "Legal & Compliance" },
    employee: { id: "u2", name: "Bima Saputra", role, department: "Customer Support" },
    developer: { id: "u3", name: "Dimas Nugroho", role, department: "Engineering" },
    legal: { id: "u4", name: "Laila Azzahra", role, department: "Legal & Compliance" },
  };
  return Response.json({ user: profiles[role], authenticated: true });
}
