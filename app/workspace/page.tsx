import { Workspace } from "@/components/workspace";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";

const roles = ["Manager", "Employee", "Developer", "Legal"] as const;

export default async function WorkspacePage() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("alethia-demo-role")?.value;
  const role = roles.find((item) => item.toLowerCase() === roleCookie);
  if (role) return <Workspace initialRole={role} mode="demo" />;
  const context = await getClientSession(cookieStore.get("alethia-session")?.value);
  if (!context || !context.organization) redirect("/login");
  const initialRole = context.user.accountRole === "org_admin" || context.user.accountRole === "manager"
    ? "Manager"
    : context.user.functionalRole === "developer" ? "Developer" : context.user.functionalRole === "legal" ? "Legal" : "Employee";
  return <Workspace initialRole={initialRole} mode="client" workspaceContext={{
    companyName: context.organization.name,
    companyInitials: context.organization.name.split(/\s+/).map((word)=>word[0]).join("").slice(0,2).toUpperCase(),
    name: context.user.name,
    title: context.user.title,
    department: context.division?.name || "All divisions",
    accountRole: context.user.accountRole,
  }} />;
}
