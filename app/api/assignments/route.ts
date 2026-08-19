import { getDemoUserId } from "@/lib/auth";
import { readDb } from "@/lib/store";
import { questionOrder } from "@/lib/verification-policy";

export async function GET(request: Request) {
  const userId = getDemoUserId(request);
  const db = await readDb();
  const assignments = db.knowledgeAssignments
    .filter((item) => item.userId === userId)
    .map((item) => ({
      ...item,
      document: db.documents.find(
        (document) => document.id === item.documentId,
      ),
      analysis: (() => {
        const analysis = db.documentAnalyses.find(
          (entry) => entry.documentId === item.documentId,
        );
        const campaign = db.campaigns.find((campaign) => campaign.id === item.campaignId);
        const order = analysis ? questionOrder(analysis.questions.length, item.id, campaign?.policy) : [];
        return analysis
          ? {
              ...analysis,
              questions: order.map((questionIndex) => analysis.questions[questionIndex]).map((question) => ({
                question: question.question,
                scenario: question.scenario,
                options: question.options,
                citation: question.citation,
              })),
            }
          : undefined;
      })(),
      campaign: db.campaigns.find(
        (campaign) => campaign.id === item.campaignId,
      ),
    }));
  return Response.json({
    assignments,
    notifications: db.notifications.filter((item) => item.userId === userId),
  });
}
