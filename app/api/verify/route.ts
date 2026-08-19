import { getDemoUserId } from "@/lib/auth";
import { calculateHealth } from "@/lib/knowledge-engine";
import { mutateDb } from "@/lib/store";
import { defaultVerificationPolicy, questionOrder } from "@/lib/verification-policy";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    documentId?: string;
    selected?: number;
    assignmentId?: string;
    answers?: number[];
  };
  const hasLegacyAnswer = typeof body.selected === "number";
  const hasQuestionAnswers = Array.isArray(body.answers);
  if (
    !body.documentId ||
    (!hasLegacyAnswer && !hasQuestionAnswers) ||
    (hasLegacyAnswer && ![0, 1].includes(body.selected!))
  )
    return Response.json(
      { error: "A valid documentId and answer payload are required" },
      { status: 400 },
    );
  const result = await mutateDb((db) => {
    const userId = getDemoUserId(request);
    const assignment = body.assignmentId
      ? db.knowledgeAssignments.find(
          (item) => item.id === body.assignmentId && item.userId === userId,
        )
      : undefined;
    if (body.assignmentId && !assignment)
      return { error: "Assignment not found for this user.", status: 404 };
    if (assignment && assignment.documentId !== body.documentId)
      return {
        error: "The document does not match this assignment.",
        status: 400,
      };
    const analysis = db.documentAnalyses.find(
      (item) => item.documentId === body.documentId,
    );
    if (assignment && !analysis)
      return {
        error: "Approved verification questions are unavailable.",
        status: 409,
      };
    const campaign = assignment ? db.campaigns.find((item) => item.id === assignment.campaignId) : undefined;
    const policy = { ...defaultVerificationPolicy, ...campaign?.policy };
    const priorAttempts = assignment ? db.verifications.filter((attempt) => attempt.userId === userId && attempt.assignmentId === assignment.id).length : 0;
    if (assignment && priorAttempts >= policy.maxAttempts) return { error: "Maximum verification attempts reached.", status: 409 };
    const order = assignment && analysis ? questionOrder(analysis.questions.length, assignment.id, campaign?.policy) : [];
    if (
      assignment &&
      analysis &&
      body.answers &&
      (body.answers.length !== order.length ||
        body.answers.some(
          (answer, index) =>
            !Number.isInteger(answer) ||
            answer < 0 ||
            answer >= analysis.questions[order[index]].options.length,
        ))
    )
      return {
        error: `Submit exactly ${order.length} valid answers for this assignment.`,
        status: 400,
      };
    const score =
      assignment && analysis && body.answers
        ? Math.round(
            (order.filter(
              (questionIndex, index) =>
                analysis.questions[questionIndex].correctIndex === body.answers![index],
            ).length /
              Math.max(1, order.length)) *
              100,
          )
        : body.selected === 1
          ? 100
          : 0;
    const passed = score >= policy.passingScore;
    const remediation =
      assignment && analysis && body.answers && !passed
        ? {
            status: "assigned" as const,
            summary:
              "Review the missed source sections below, then retry the verification when ready.",
            citations: order
              .filter(
                (questionIndex, index) =>
                  analysis.questions[questionIndex].correctIndex !==
                  body.answers![index],
              )
              .map(
                (questionIndex) =>
                  `${analysis.questions[questionIndex].citation}: ${analysis.questions[questionIndex].explanation}`,
              ),
            retryAvailableAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          }
        : null;
    const expiresAt = passed ? new Date(Date.now() + policy.certificationDays * 86400000).toISOString() : null;
    db.verifications.push({
      id: `verify-${Date.now()}`,
      userId,
      documentId: body.documentId!,
      score,
      passed,
      createdAt: new Date().toISOString(),
      assignmentId: assignment?.id,
      expiresAt,
    });
    const user = db.users.find((u) => u.id === userId);
    if (user && passed) user.verified = true;
    if (assignment) {
      assignment.status = passed ? "completed" : "failed";
      assignment.score = score;
      assignment.completedAt = new Date().toISOString();
      db.notifications
        .filter((item) => item.assignmentId === assignment.id)
        .forEach((item) => (item.read = true));
      if (passed && assignment.remediation)
        assignment.remediation.status = "completed";
      if (remediation) {
        assignment.remediation = remediation;
        db.agentTasks.push({
          id: `remediation-${assignment.id}-${Date.now()}`,
          type: "targeted-remediation",
          status: "scheduled",
          detail: `${userId} · ${remediation.citations.join(" | ")}`,
          createdAt: new Date().toISOString(),
        });
        db.notifications.unshift({
          id: `notification-remediation-${Date.now()}`,
          userId,
          assignmentId: assignment.id,
          title: "Targeted remediation is ready",
          detail:
            "Review the cited source guidance, then retry your verification.",
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
    const isClientUser = db.clientAccounts.some((item) => item.id === userId);
    const allSensitiveUsersVerified = isClientUser && assignment
      ? db.knowledgeAssignments
          .filter((item) => item.campaignId === assignment.campaignId)
          .every((item) => item.status === "completed")
      : db.users
          .filter((u) => u.sensitiveAccess)
          .every((u) => u.verified);
    if (allSensitiveUsersVerified)
      db.risks
        .filter((r) => r.documentId === body.documentId)
        .forEach((r) => (r.status = "resolved"));
    db.audit.unshift({
      id: `audit-${Date.now()}`,
      actor: userId,
      action: "verification.completed",
      detail: `${passed ? "Passed" : "Failed"} with ${score}%`,
      createdAt: new Date().toISOString(),
    });
    return {
      passed,
      score,
      attemptsRemaining: Math.max(0, policy.maxAttempts - priorAttempts - 1),
      certificationExpiresAt: expiresAt,
      health: calculateHealth(db),
      riskResolved: allSensitiveUsersVerified,
      remediation,
    };
  });
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json(result);
}
