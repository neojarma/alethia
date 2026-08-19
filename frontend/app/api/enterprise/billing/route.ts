import { getOrganizationId, requireOrgAdmin } from "@/lib/auth";
import { getEntitlements } from "@/lib/enterprise";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request){try{requireOrgAdmin(request);const db=await readDb();const result=getEntitlements(db,getOrganizationId(request));return result?Response.json(result):Response.json({error:"subscription not found"},{status:404});}catch(error){if(error instanceof Response)return error;throw error;}}
export async function PUT(request: Request){try{requireOrgAdmin(request);const id=getOrganizationId(request);const body=await request.json() as {plan?:"starter"|"business"|"enterprise";seats?:number};if(!body.plan)return Response.json({error:"plan is required"},{status:400});const subscription=await mutateDb(db=>{const item=db.subscriptions.find(x=>x.organizationId===id);if(!item)return null;item.plan=body.plan!;item.seats=Math.max(1,body.seats||item.seats);item.status="active";return item;});return subscription?Response.json({subscription}):Response.json({error:"subscription not found"},{status:404});}catch(error){if(error instanceof Response)return error;throw error;}}
