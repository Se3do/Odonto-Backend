-- AlterTable
ALTER TABLE "Case" ADD COLUMN "DeletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "DeletedAt" TIMESTAMP(3);