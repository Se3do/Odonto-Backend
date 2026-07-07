import type { PrismaClient } from "@prisma/client";

import { caseDefinitions } from "./constants";
import { ids } from "./ids";

export async function seedAttempts(prisma: PrismaClient) {
  const firstCase = caseDefinitions[0];
  const secondCase = caseDefinitions[1];

  const firstAttempt = await prisma.userAttempt.create({
    data: {
      Id: ids.attempts.one,
      Score: 85,
      XpEarned: 120,
      StartedAt: new Date("2026-01-14T17:00:00.000Z"),
      CompletedAt: new Date("2026-01-14T17:18:00.000Z"),
      UserId: ids.users.admin,
      CaseId: firstCase.id,
      ChosenDiagnosisId: firstCase.diagnosisId,
    },
  });

  const secondAttempt = await prisma.userAttempt.create({
    data: {
      Id: ids.attempts.two,
      Score: 40,
      XpEarned: 35,
      StartedAt: new Date("2026-01-14T18:00:00.000Z"),
      CompletedAt: null,
      UserId: ids.users.assistant,
      CaseId: secondCase.id,
      ChosenDiagnosisId: ids.diagnoses.irreversiblePulpitis,
    },
  });

  await prisma.attemptTest.createMany({
    data: [
      {
        AttemptId: firstAttempt.Id,
        CaseId: firstCase.id,
        TestId: ids.tests.percussion,
      },
      {
        AttemptId: firstAttempt.Id,
        CaseId: firstCase.id,
        TestId: ids.tests.thermalSensitivity,
      },
      {
        AttemptId: secondAttempt.Id,
        CaseId: secondCase.id,
        TestId: ids.tests.radiograph,
      },
    ],
  });

  await prisma.attemptTreatment.createMany({
    data: [
      {
        AttemptId: firstAttempt.Id,
        CaseId: firstCase.id,
        TreatmentId: ids.treatments.rootCanalTherapy,
      },
      {
        AttemptId: secondAttempt.Id,
        CaseId: secondCase.id,
        TreatmentId: ids.treatments.incisionAndDrainage,
      },
    ],
  });
}