import { ids } from "./ids";

export const seedConfig = {
  baseDate: new Date("2026-01-01T00:00:00.000Z"),
  passwordHash: "$2b$10$O5p8q2D0v4vGmX9lJXQxQeS5l8e1Q7tV5t0WJdY1xQf6WJ3B0zW3O",
} as const;

export const specialties = [
  { id: ids.specialties.endodontics, name: "Endodontics" },
  { id: ids.specialties.periodontics, name: "Periodontics" },
  { id: ids.specialties.oralSurgery, name: "Oral Surgery" },
  { id: ids.specialties.prosthodontics, name: "Prosthodontics" },
] as const;

export const diagnoses = [
  { id: ids.diagnoses.irreversiblePulpitis, name: "Irreversible Pulpitis" },
  { id: ids.diagnoses.chronicApicalPeriodontitis, name: "Chronic Apical Periodontitis" },
  { id: ids.diagnoses.acutePeriapicalAbscess, name: "Acute Periapical Abscess" },
  { id: ids.diagnoses.impactedThirdMolar, name: "Impacted Third Molar" },
  { id: ids.diagnoses.gingivalRecession, name: "Gingival Recession" },
] as const;

export const tests = [
  { id: ids.tests.percussion, name: "Percussion Test" },
  { id: ids.tests.thermalSensitivity, name: "Thermal Sensitivity Test" },
  { id: ids.tests.vitalityTest, name: "Vitality Test" },
  { id: ids.tests.probing, name: "Periodontal Probing" },
  { id: ids.tests.radiograph, name: "Periapical Radiograph Review" },
  { id: ids.tests.occlusionCheck, name: "Occlusion Check" },
] as const;

export const treatments = [
  { id: ids.treatments.rootCanalTherapy, name: "Root Canal Therapy" },
  { id: ids.treatments.incisionAndDrainage, name: "Incision and Drainage" },
  { id: ids.treatments.extraction, name: "Extraction" },
  { id: ids.treatments.periodontalScaling, name: "Periodontal Scaling and Root Planing" },
  { id: ids.treatments.crownLengthening, name: "Crown Lengthening" },
  { id: ids.treatments.prostheticRehabilitation, name: "Prosthetic Rehabilitation" },
] as const;

export const users = [
  {
    id: ids.users.admin,
    userName: "admin",
    email: "admin@odonto.test",
    passwordHash: seedConfig.passwordHash,
    xpTotal: 1200,
    currentStreak: 7,
    longestStreak: 12,
    lastCompletedDate: new Date("2026-01-14T18:00:00.000Z"),
  },
  {
    id: ids.users.assistant,
    userName: "assistant",
    email: "assistant@odonto.test",
    passwordHash: seedConfig.passwordHash,
    xpTotal: 300,
    currentStreak: 2,
    longestStreak: 5,
    lastCompletedDate: null,
  },
] as const;

export const caseDefinitions = [
  {
    id: ids.cases.caseOne,
    title: "Upper left molar with lingering pain",
    patientHistory: "The patient reports spontaneous pain, worse at night, with lingering cold sensitivity.",
    difficulty: "MEDIUM",
    diagnosisExplanation: "Symptoms and thermal response are most consistent with irreversible pulpitis.",
    diagnosisId: ids.diagnoses.irreversiblePulpitis,
    specialtyId: ids.specialties.endodontics,
    createdAt: new Date("2026-01-03T10:00:00.000Z"),
    imageType: "XRay",
  },
  {
    id: ids.cases.caseTwo,
    title: "Mandibular molar swelling and drainage",
    patientHistory: "Facial swelling developed over two days with a fluctuant vestibular abscess.",
    difficulty: "HARD",
    diagnosisExplanation: "The localized swelling and purulence suggest an acute periapical abscess.",
    diagnosisId: ids.diagnoses.acutePeriapicalAbscess,
    specialtyId: ids.specialties.oralSurgery,
    createdAt: new Date("2026-01-04T10:00:00.000Z"),
    imageType: "CT",
  },
  {
    id: ids.cases.caseThree,
    title: "Generalized gingival recession concern",
    patientHistory: "The patient is concerned about root exposure and sensitivity during brushing.",
    difficulty: "EASY",
    diagnosisExplanation: "The pattern of recession and sensitivity is consistent with gingival recession.",
    diagnosisId: ids.diagnoses.gingivalRecession,
    specialtyId: ids.specialties.periodontics,
    createdAt: new Date("2026-01-05T10:00:00.000Z"),
    imageType: "ClinicalPhoto",
  },
] as const;

export const dailyCaseDates = [
  { id: ids.dailyCases.one, date: new Date("2026-01-10T00:00:00.000Z"), caseId: ids.cases.caseOne },
  { id: ids.dailyCases.two, date: new Date("2026-01-11T00:00:00.000Z"), caseId: ids.cases.caseTwo },
  { id: ids.dailyCases.three, date: new Date("2026-01-12T00:00:00.000Z"), caseId: ids.cases.caseThree },
] as const;
