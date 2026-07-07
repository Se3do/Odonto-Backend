import type { PrismaClient } from "@prisma/client";

import { treatments } from "./constants";

export async function seedTreatments(prisma: PrismaClient) {
  await prisma.treatment.createMany({
    data: treatments.map((treatment) => ({
      Id: treatment.id,
      Name: treatment.name,
    })),
  });
}