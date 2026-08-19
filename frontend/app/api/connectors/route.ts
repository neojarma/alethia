import { getAccountRole, getDivisionScope, getOrganizationId, requireRole } from "@/lib/auth";
import { connectorTypes, validateConnectorConfig, type ConnectorType } from "@/lib/connectors";
import { mutateDb, readDb } from "@/lib/store";

export async function GET(request: Request) {
  try {
    requireRole(request, ["manager", "legal"]);
    const db = await readDb(); const organizationId=getOrganizationId(request); const clientRequest=Boolean(getAccountRole(request));
    const connectors=db.connectors.filter((item)=>clientRequest?item.organizationId===organizationId:(!item.organizationId||item.organizationId===organizationId));
    const ids=new Set(connectors.map((item)=>item.id));
    return Response.json({ connectors, syncRuns: db.syncRuns.filter((item)=>ids.has(item.connectorId)).slice(-20).reverse() });
  } catch (error) { if (error instanceof Response) return error; throw error; }
}
export async function POST(request: Request) {
  try {
    const role=requireRole(request,["manager"]); const organizationId=getOrganizationId(request); const divisionId=getDivisionScope(request);
    const body=await request.json() as {type?:ConnectorType;name?:string;config?:Record<string,string>;schedule?:"manual"|"hourly"|"daily"|"weekly"};
    if(!body.type||!connectorTypes.includes(body.type)||!body.name)return Response.json({error:"supported type and name are required"},{status:400});
    const check=validateConnectorConfig(body.type,body.config||{}); if(!check.valid)return Response.json({error:`missing configuration: ${check.missing.join(", ")}`},{status:400});
    const connector=await mutateDb((db)=>{if(db.connectors.some((item)=>item.type===body.type&&item.organizationId===organizationId&&item.divisionId===divisionId))return null;const schedule=body.schedule||"daily";const now=new Date();const nextSyncAt=schedule==="manual"?null:new Date(now.getTime()+({hourly:3600000,daily:86400000,weekly:604800000}[schedule]||86400000)).toISOString();const item={id:`connector-${Date.now()}`,type:body.type!,name:body.name!,status:"connected" as const,lastSyncAt:null,config:body.config||{},organizationId,divisionId,schedule,nextSyncAt,createdAt:now.toISOString()};db.connectors.push(item);db.audit.unshift({id:`audit-${Date.now()}`,actor:role,action:"connector.created",detail:`${item.type}: ${item.name} · ${schedule} sync`,organizationId,createdAt:now.toISOString()});return item;});
    return connector?Response.json({connector},{status:201}):Response.json({error:"connector type is already configured"},{status:409});
  } catch(error){if(error instanceof Response)return error;throw error;}
}
