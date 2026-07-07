import type { PrismaClient } from "@prisma/client";

import { dailyCaseDates } from "./constants";

export async function seedDailyCases(prisma: PrismaClient) {
  await prisma.dailyCase.createMany({
    data: dailyCaseDates.map((dailyCase) => ({
      Id: dailyCase.id,
      Date: dailyCase.date,
      CaseId: dailyCase.caseId,
    })),
  });
}