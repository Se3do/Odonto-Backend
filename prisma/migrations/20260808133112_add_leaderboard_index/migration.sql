-- CreateIndex
CREATE INDEX "User_Role_XpTotal_LongestStreak_idx" ON "User"("Role", "XpTotal" DESC, "LongestStreak" DESC);
