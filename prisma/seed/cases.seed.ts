import type { Difficulty, ImageType, PrismaClient } from "@prisma/client";

import { caseDefinitions, tests, treatments } from "./constants";

const caseTestMatrix = [
  {
    caseId: caseDefinitions[0].id,
    tests: [
      { testId: tests[0].id, isCorrect: true, testResult: "Sharp pain on percussion of tooth 26, consistent with periapical inflammation.", testCost: 1 },
      { testId: tests[1].id, isCorrect: true, testResult: "Lingering pain (>10 seconds) after cold stimulus on tooth 26, indicating irreversibly inflamed pulp.", testCost: 1 },
      { testId: tests[4].id, isCorrect: false, testResult: "Periapical radiograph shows slight widening of the PDL around tooth 26, no visible caries or periapical radiolucency.", testCost: 1 },
    ],
    treatments: [
      { treatmentId: treatments[0].id, isCorrect: true },
      { treatmentId: treatments[4].id, isCorrect: false },
    ],
  },
  {
    caseId: caseDefinitions[1].id,
    tests: [
      { testId: tests[0].id, isCorrect: true, testResult: "Exquisitely tender to percussion on tooth 36 with surrounding mucosal erythema.", testCost: 1 },
      { testId: tests[4].id, isCorrect: true, testResult: "Periapical radiolucency visible at the apex of tooth 36 with loss of lamina dura.", testCost: 1 },
      { testId: tests[5].id, isCorrect: false, testResult: "Normal occlusal contacts; no trauma from occlusion detected.", testCost: 1 },
    ],
    treatments: [
      { treatmentId: treatments[1].id, isCorrect: true },
      { treatmentId: treatments[2].id, isCorrect: true },
    ],
  },
  {
    caseId: caseDefinitions[2].id,
    tests: [
      { testId: tests[3].id, isCorrect: true, testResult: "Probing depths 2-3mm general, with 4-5mm recession on facial surfaces of lower anteriors, Miller Class I.", testCost: 1 },
      { testId: tests[4].id, isCorrect: false, testResult: "Radiographs show normal bone levels, no horizontal or vertical bone loss.", testCost: 1 },
      { testId: tests[5].id, isCorrect: false, testResult: "Normal occlusion, no signs of traumatic occlusal forces.", testCost: 1 },
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
        TestResult: test.testResult,
        TestCost: test.testCost,
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