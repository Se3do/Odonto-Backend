import type { Difficulty, ImageType, PrismaClient } from "@prisma/client";

import { caseDefinitions, tests, treatments } from "./constants";

const caseTestMatrix = [
  {
    caseId: caseDefinitions[0].id,
    tests: [
      { testId: tests[0].id, isCorrect: true },
      { testId: tests[1].id, isCorrect: true },
      { testId: tests[4].id, isCorrect: false },
    ],
    treatments: [
      { treatmentId: treatments[0].id, isCorrect: true },
      { treatmentId: treatments[4].id, isCorrect: false },
    ],
  },
  {
    caseId: caseDefinitions[1].id,
    tests: [
      { testId: tests[0].id, isCorrect: true },
      { testId: tests[4].id, isCorrect: true },
      { testId: tests[5].id, isCorrect: false },
    ],
    treatments: [
      { treatmentId: treatments[1].id, isCorrect: true },
      { treatmentId: treatments[2].id, isCorrect: true },
    ],
  },
  {
    caseId: caseDefinitions[2].id,
    tests: [
      { testId: tests[3].id, isCorrect: true },
      { testId: tests[4].id, isCorrect: false },
      { testId: tests[5].id, isCorrect: false },
    ],
    treatments: [
      { treatmentId: treatments[3].id, isCorrect: true },
      { treatmentId: treatments[4].id, isCorrect: false },
    ],
  },
] as const;

export async function seedCases(prisma: PrismaClient) {
  for (const caseDefinition of caseDefinitions) {
    await prisma.case.create({
      data: {
        Id: caseDefinition.id,
        Title: caseDefinition.title,
        PatientHistory: caseDefinition.patientHistory,
        Difficulty: caseDefinition.difficulty as Difficulty,
        DiagnosisExplanation: caseDefinition.diagnosisExplanation,
        CreatedAt: caseDefinition.createdAt,
        AiGenerated: false,
        DiagnosisId: caseDefinition.diagnosisId,
        SpecialtyId: caseDefinition.specialtyId,
        CaseImages: {
          create: {
            Url: `https://odonto.test/cases/${caseDefinition.id}/image.jpg`,
            ImageType: caseDefinition.imageType as ImageType,
          },
        },
      },
    });
  }

  for (const caseData of caseTestMatrix) {
    await prisma.caseTest.createMany({
      data: caseData.tests.map((test) => ({
        CaseId: caseData.caseId,
        TestId: test.testId,
        IsCorrect: test.isCorrect,
      })),
    });

    await prisma.caseTreatment.createMany({
      data: caseData.treatments.map((treatment) => ({
        CaseId: caseData.caseId,
        TreatmentId: treatment.treatmentId,
        IsCorrect: treatment.isCorrect,
      })),
    });
  }
}