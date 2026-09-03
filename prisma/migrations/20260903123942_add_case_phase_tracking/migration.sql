-- CreateEnum
CREATE TYPE "CasePhase" AS ENUM ('TESTING', 'DIAGNOSING', 'TREATING', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "UserAttempt" DROP CONSTRAINT "UserAttempt_ChosenDiagnosisId_fkey";

-- AlterTable
ALTER TABLE "CaseTests" ADD COLUMN     "TestCost" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "TestResult" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "UserAttempt" ADD COLUMN     "Budget" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "Phase" "CasePhase" NOT NULL DEFAULT 'TESTING',
ADD COLUMN     "TestsUsed" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "Score" DROP NOT NULL,
ALTER COLUMN "XpEarned" DROP NOT NULL,
ALTER COLUMN "ChosenDiagnosisId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserAttempt" ADD CONSTRAINT "UserAttempt_ChosenDiagnosisId_fkey" FOREIGN KEY ("ChosenDiagnosisId") REFERENCES "Diagnosis"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
