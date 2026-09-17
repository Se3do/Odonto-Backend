-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ResetTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "ResetTokenHash" TEXT;
