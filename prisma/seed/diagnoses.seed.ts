import type { PrismaClient } from "@prisma/client";

import { diagnoses } from "./constants";

export async function seedDiagnoses(prisma: PrismaClient) {
  await prisma.diagnosis.createMany({
    data: diagnoses.map((diagnosis) => ({
      Id: diagnosis.id,
      Name: diagnosis.name,
    })),
  });
}