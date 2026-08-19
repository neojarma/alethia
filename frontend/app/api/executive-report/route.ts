import { getOrganizationId, requireRole } from "@/lib/auth";
import { readDb } from "@/lib/store";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

const safePdfText = (value: string, maxLength = 160) =>
  value
    .normalize("NFKD")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7E]/g, "")
    .slice(0, maxLength);

const wrap = (text: string, width = 78) => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (`${line} ${word}`.trim().length > width) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines;
};

export async function GET(request: Request) {
  try {
    requireRole(request, ["manager", "legal"]);
    const organizationId = getOrganizationId(request);
    const db = await readDb();
    const organization = db.organizations.find((item) => item.id === organizationId);
    const campaigns = db.campaigns.filter(
      (item) => !item.organizationId || item.organizationId === organizationId,
    );
    const evidence = db.impactEvidence.filter((item) =>
      campaigns.some((campaign) => campaign.id === item.campaignId),
    );
    const totalAudience = campaigns.reduce((sum, item) => sum + item.audience, 0);
    const verified = campaigns.reduce(
      (sum, campaign) =>
        sum +
        db.knowledgeAssignments.filter(
          (item) =>
            item.campaignId === campaign.id && item.status === "completed",
        ).length,
      0,
    );
    const hoursSaved = evidence.reduce(
      (sum, item) =>
        sum + Math.max(0, item.manualHoursBefore - item.hoursWithAlethia),
      0,
    );
    const risksClosed = evidence.reduce((sum, item) => sum + item.risksClosed, 0);
    const averageLift = evidence.length
      ? Math.round(
          evidence.reduce(
            (sum, item) => sum + (item.currentReadiness - item.baselineReadiness),
            0,
          ) / evidence.length,
        )
      : 0;
    const pdf = await PDFDocument.create();
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const page = pdf.addPage([595, 842]);
    page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.97, 0.965, 0.995) });
    page.drawRectangle({ x: 0, y: 690, width: 595, height: 152, color: rgb(0.12, 0.1, 0.17) });
    page.drawText("ALETHIA", { x: 45, y: 795, size: 11, font: bold, color: rgb(0.55, 0.46, 0.98) });
    page.drawText("Executive readiness report", { x: 45, y: 752, size: 27, font: bold, color: rgb(1, 1, 1) });
    page.drawText(safePdfText(organization?.name || "Alethia Company", 60), { x: 45, y: 720, size: 13, font: regular, color: rgb(0.78, 0.76, 0.83) });
    const metrics = [
      [String(campaigns.length), "Campaigns"],
      [totalAudience ? `${Math.round((verified / totalAudience) * 100)}%` : "0%", "Verified"],
      [String(hoursSaved), "Hours saved"],
      [String(risksClosed), "Risks closed"],
    ];
    metrics.forEach(([value, label], index) => {
      const x = 45 + index * 128;
      page.drawRectangle({ x, y: 608, width: 112, height: 62, color: rgb(1, 1, 1), borderColor: rgb(0.88, 0.86, 0.94), borderWidth: 1 });
      page.drawText(value, { x: x + 12, y: 637, size: 21, font: bold, color: rgb(0.2, 0.17, 0.28) });
      page.drawText(label, { x: x + 12, y: 620, size: 8, font: regular, color: rgb(0.45, 0.42, 0.5) });
    });
    page.drawText("Decision summary", { x: 45, y: 568, size: 16, font: bold, color: rgb(0.2, 0.17, 0.28) });
    page.drawRectangle({ x: 45, y: 505, width: 505, height: 48, color: rgb(0.91, 0.89, 1) });
    page.drawText(
      evidence.length
        ? `Measured pilots improved readiness by ${averageLift >= 0 ? "+" : ""}${averageLift} points on average.`
        : "Start with one pilot campaign to establish a measurable readiness baseline.",
      { x: 59, y: 531, size: 11, font: bold, color: rgb(0.27, 0.2, 0.52) },
    );
    page.drawText(
      evidence.length
        ? "Recommendation: expand the proven workflow to the next highest-risk division."
        : "Recommendation: approve source material, launch verification, then record the outcome.",
      { x: 59, y: 514, size: 9, font: regular, color: rgb(0.38, 0.34, 0.46) },
    );
    page.drawText("Measured business impact", { x: 45, y: 474, size: 16, font: bold, color: rgb(0.2, 0.17, 0.28) });
    let y = 446;
    if (!evidence.length) {
      page.drawText("No pilot evidence has been recorded yet. Establish a campaign baseline to begin measuring impact.", { x: 45, y, size: 10, font: regular, color: rgb(0.45, 0.42, 0.5) });
      y -= 30;
    }
    evidence.slice(0, 5).forEach((item) => {
      const campaign = campaigns.find((entry) => entry.id === item.campaignId);
      const delta = item.currentReadiness - item.baselineReadiness;
      page.drawText(safePdfText(campaign?.title || "Campaign", 72), { x: 45, y, size: 11, font: bold, color: rgb(0.25, 0.2, 0.45) });
      y -= 16;
      page.drawText(`${delta >= 0 ? "+" : ""}${delta} readiness points  |  ${Math.max(0, item.manualHoursBefore - item.hoursWithAlethia)} hours saved  |  ${item.risksClosed} risks closed`, { x: 45, y, size: 9, font: regular, color: rgb(0.35, 0.32, 0.4) });
      y -= 14;
      page.drawText(`Evidence source: ${safePdfText(item.evidenceSource, 76)}`, { x: 45, y, size: 8, font: regular, color: rgb(0.49, 0.45, 0.55) });
      y -= 24;
    });
    page.drawText("Leadership evidence", { x: 45, y, size: 16, font: bold, color: rgb(0.2, 0.17, 0.28) });
    y -= 28;
    const quote = evidence.find((item) => item.managerQuote)?.managerQuote || "Alethia connects approved knowledge to measurable employee action and audit-ready evidence.";
    wrap(`"${safePdfText(quote)}"`).forEach((line) => {
      page.drawText(line, { x: 45, y, size: 11, font: regular, color: rgb(0.32, 0.28, 0.38) });
      y -= 16;
    });
    const author = evidence.find((item) => item.managerName)?.managerName;
    if (author) page.drawText(`- ${safePdfText(author, 60)}`, { x: 45, y: y - 4, size: 9, font: bold, color: rgb(0.43, 0.34, 0.74) });
    page.drawText(`Generated ${new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date())} - Source-linked Alethia evidence`, { x: 45, y: 38, size: 8, font: regular, color: rgb(0.5, 0.47, 0.55) });
    const bytes = await pdf.save();
    return new Response(Buffer.from(bytes), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="alethia-executive-readiness-report.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: error instanceof Error ? error.message : "Report generation failed." },
      { status: 500 },
    );
  }
}
