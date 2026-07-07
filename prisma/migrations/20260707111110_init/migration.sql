-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('XRay', 'CT', 'MRI', 'ClinicalPhoto', 'Diagram');

-- CreateTable
CREATE TABLE "User" (
    "Id" TEXT NOT NULL,
    "UserName" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "XpTotal" INTEGER NOT NULL DEFAULT 0,
    "CurrentStreak" INTEGER NOT NULL DEFAULT 0,
    "LongestStreak" INTEGER NOT NULL DEFAULT 0,
    "LastCompletedDate" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Specialty" (
    "Id" TEXT NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "Id" TEXT NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Test" (
    "Id" TEXT NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "Id" TEXT NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Case" (
    "Id" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "PatientHistory" TEXT NOT NULL,
    "Difficulty" "Difficulty" NOT NULL,
    "DiagnosisExplanation" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "AiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "DiagnosisId" TEXT NOT NULL,
    "SpecialtyId" TEXT NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "CaseTests" (
    "CaseId" TEXT NOT NULL,
    "TestId" TEXT NOT NULL,
    "IsCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "CaseTests_pkey" PRIMARY KEY ("CaseId","TestId")
);

-- CreateTable
CREATE TABLE "CaseTreatments" (
    "CaseId" TEXT NOT NULL,
    "TreatmentId" TEXT NOT NULL,
    "IsCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "CaseTreatments_pkey" PRIMARY KEY ("CaseId","TreatmentId")
);

-- CreateTable
CREATE TABLE "CaseImages" (
    "Id" TEXT NOT NULL,
    "Url" TEXT NOT NULL,
    "ImageType" "ImageType" NOT NULL,
    "CaseId" TEXT NOT NULL,

    CONSTRAINT "CaseImages_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "DailyCase" (
    "Id" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "CaseId" TEXT NOT NULL,

    CONSTRAINT "DailyCase_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserAttempt" (
    "Id" TEXT NOT NULL,
    "Score" DOUBLE PRECISION NOT NULL,
    "XpEarned" INTEGER NOT NULL,
    "StartedAt" TIMESTAMP(3) NOT NULL,
    "CompletedAt" TIMESTAMP(3),
    "UserId" TEXT NOT NULL,
    "CaseId" TEXT NOT NULL,
    "ChosenDiagnosisId" TEXT NOT NULL,

    CONSTRAINT "UserAttempt_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AttemptTests" (
    "AttemptId" TEXT NOT NULL,
    "CaseId" TEXT NOT NULL,
    "TestId" TEXT NOT NULL,

    CONSTRAINT "AttemptTests_pkey" PRIMARY KEY ("AttemptId","CaseId","TestId")
);

-- CreateTable
CREATE TABLE "AttemptTreatments" (
    "AttemptId" TEXT NOT NULL,
    "CaseId" TEXT NOT NULL,
    "TreatmentId" TEXT NOT NULL,

    CONSTRAINT "AttemptTreatments_pkey" PRIMARY KEY ("AttemptId","CaseId","TreatmentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_UserName_key" ON "User"("UserName");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_Name_key" ON "Specialty"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_Name_key" ON "Diagnosis"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Test_Name_key" ON "Test"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Treatment_Name_key" ON "Treatment"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCase_Date_key" ON "DailyCase"("Date");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_DiagnosisId_fkey" FOREIGN KEY ("DiagnosisId") REFERENCES "Diagnosis"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_SpecialtyId_fkey" FOREIGN KEY ("SpecialtyId") REFERENCES "Specialty"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTests" ADD CONSTRAINT "CaseTests_CaseId_fkey" FOREIGN KEY ("CaseId") REFERENCES "Case"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTests" ADD CONSTRAINT "CaseTests_TestId_fkey" FOREIGN KEY ("TestId") REFERENCES "Test"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTreatments" ADD CONSTRAINT "CaseTreatments_CaseId_fkey" FOREIGN KEY ("CaseId") REFERENCES "Case"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTreatments" ADD CONSTRAINT "CaseTreatments_TreatmentId_fkey" FOREIGN KEY ("TreatmentId") REFERENCES "Treatment"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseImages" ADD CONSTRAINT "CaseImages_CaseId_fkey" FOREIGN KEY ("CaseId") REFERENCES "Case"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCase" ADD CONSTRAINT "DailyCase_CaseId_fkey" FOREIGN KEY ("CaseId") REFERENCES "Case"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_CaseId_fkey" FOREIGN KEY ("CaseId") REFERENCES "Case"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_ChosenDiagnosisId_fkey" FOREIGN KEY ("ChosenDiagnosisId") REFERENCES "Diagnosis"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptTests" ADD CONSTRAINT "AttemptTests_AttemptId_fkey" FOREIGN KEY ("AttemptId") REFERENCES "UserAttempt"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptTests" ADD CONSTRAINT "AttemptTests_CaseId_TestId_fkey" FOREIGN KEY ("CaseId", "TestId") REFERENCES "CaseTests"("CaseId", "TestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptTreatments" ADD CONSTRAINT "AttemptTreatments_AttemptId_fkey" FOREIGN KEY ("AttemptId") REFERENCES "UserAttempt"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptTreatments" ADD CONSTRAINT "AttemptTreatments_CaseId_TreatmentId_fkey" FOREIGN KEY ("CaseId", "TreatmentId") REFERENCES "CaseTreatments"("CaseId", "TreatmentId") ON DELETE RESTRICT ON UPDATE CASCADE;
