ALTER TABLE "User"
ADD COLUMN "RefreshTokenHash" TEXT,
ADD COLUMN "RefreshTokenExpiresAt" TIMESTAMP(3);