import { getDivisionScope, getOrganizationId } from "@/lib/auth";
import { hashPassword, readAuthContext } from "@/lib/client-auth";
import { mutateDb, readDb } from "@/lib/store";
import type { DemoRole } from "@/lib/domain";

export async function GET(request: Request) {
  const db = await readDb();
  const context = readAuthContext(request.headers.get("cookie"));
  if (!context) return Response.json({ people: db.users.map((user) => ({ id:user.id,name:user.name,email:`${user.name.toLowerCase().replace(/\s+/g,".")}@alethia.id`,division:user.department,title:user.role,accountRole:user.role==="manager"?"manager":"member",functionalRole:user.role,readiness:user.verified?100:72,status:user.verified?"Verified":"Action needed" })) });
  const organizationId = getOrganizationId(request); const divisionId = getDivisionScope(request);
  const people = db.clientAccounts.filter((user) => user.organizationId === organizationId && (!divisionId || user.divisionId === divisionId)).map((user) => {
    const assignments=db.knowledgeAssignments.filter((item)=>item.userId===user.id); const completed=assignments.filter((item)=>item.status==="completed");
    const readiness=assignments.length?Math.round(completed.reduce((sum,item)=>sum+(item.score||0),0)/assignments.length):100;
    return { id:user.id,name:user.name,email:user.email,division:db.divisions.find((item)=>item.id===user.divisionId)?.name||"All divisions",title:user.title,accountRole:user.accountRole,functionalRole:user.functionalRole,readiness,status:readiness>=80?"Verified":"Action needed" };
  });
  return Response.json({ people, scope: divisionId ? "division" : "organization", canInvite: context.accountRole !== "member" });
}

export async function POST(request: Request) {
  const context=readAuthContext(request.headers.get("cookie")); if(!context || context.accountRole==="member") return Response.json({error:"Manager access required"},{status:403});
  const body=await request.json(); const email=String(body.email||"").trim().toLowerCase(); const name=String(body.name||"").trim();
  const divisionId=context.accountRole==="manager"?context.divisionId:String(body.divisionId||"");
  if(!email||!name||!divisionId) return Response.json({error:"Name, email and division are required."},{status:400});
  const person=await mutateDb((db)=>{if(db.clientAccounts.some((item)=>item.email.toLowerCase()===email))throw new Error("Email already exists");const division=db.divisions.find((item)=>item.id===divisionId&&item.organizationId===context.organizationId);if(!division)throw new Error("Division is outside your scope");const functionalRole=(['manager','employee','developer','legal'].includes(body.functionalRole)?body.functionalRole:'employee') as DemoRole;const item={id:`ca-${crypto.randomUUID()}`,organizationId:context.organizationId,divisionId,name,email,passwordHash:hashPassword(String(body.password||"Welcome123!")),accountRole:body.accountRole==="manager"?"manager" as const:"member" as const,functionalRole,title:String(body.title||functionalRole),status:"active" as const,createdAt:new Date().toISOString()};db.clientAccounts.push(item);return {...item,passwordHash:undefined};});
  return Response.json({person},{status:201});
}
