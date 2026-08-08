-- CreateIndex
CREATE INDEX "Case_SpecialtyId_idx" ON "Case"("SpecialtyId");

-- CreateIndex
CREATE INDEX "CaseImages_CaseId_idx" ON "CaseImages"("CaseId");

-- CreateIndex
CREATE INDEX "DailyCase_CaseId_idx" ON "DailyCase"("CaseId");

-- CreateIndex
CREATE INDEX "UserAttempt_UserId_CaseId_idx" ON "UserAttempt"("UserId", "CaseId");

-- CreateIndex
CREATE INDEX "UserAttempt_CaseId_idx" ON "UserAttempt"("CaseId");
