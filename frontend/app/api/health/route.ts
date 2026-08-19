import { getAccountRole, getDivisionScope, getOrganizationId } from "@/lib/auth";
import { calculateHealth } from "@/lib/knowledge-engine";
import { readDb } from "@/lib/store";

export async function GET(request: Request) {
  const db=await readDb(); const accountRole=getAccountRole(request);
  if(!accountRole)return Response.json({health:calculateHealth(db),verificationCoverage:Math.round(db.users.filter((user)=>user.verified).length/Math.max(db.users.length,1)*100),overdueWork:db.users.filter((user)=>user.sensitiveAccess&&!user.verified).length,openRisks:db.risks.filter((risk)=>risk.status==="open").length});
  const organizationId=getOrganizationId(request); const divisionId=getDivisionScope(request);
  const users=db.clientAccounts.filter((user)=>user.organizationId===organizationId&&(!divisionId||user.divisionId===divisionId)); const ids=new Set(users.map((user)=>user.id));
  const assignments=db.knowledgeAssignments.filter((item)=>ids.has(item.userId)); const completed=assignments.filter((item)=>item.status==="completed"); const failed=assignments.filter((item)=>item.status==="failed");
  const verificationCoverage=assignments.length?Math.round(completed.length/assignments.length*100):0; const overdueWork=assignments.filter((item)=>item.status!=="completed"&&new Date(item.dueAt)<new Date()).length;
  const divisions=db.divisions.filter((item)=>item.organizationId===organizationId&&(!divisionId||item.id===divisionId)).map((division)=>{const divisionUsers=users.filter((user)=>user.divisionId===division.id);const divisionIds=new Set(divisionUsers.map((user)=>user.id));const work=assignments.filter((item)=>divisionIds.has(item.userId));const done=work.filter((item)=>item.status==="completed");return{name:division.name,people:divisionUsers.length,coverage:work.length?Math.round(done.length/work.length*100):0};});
  const health=Math.round(verificationCoverage*.7+(failed.length?Math.max(0,100-failed.length*10):100)*.3);
  return Response.json({health,verificationCoverage,overdueWork,openRisks:failed.length,divisions});
}
