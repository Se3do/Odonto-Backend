import type { PrismaClient } from "@prisma/client";

import { specialties } from "./constants";

export async function seedSpecialties(prisma: PrismaClient) {
  await prisma.specialty.createMany({
    data: specialties.map((specialty) => ({
      Id: specialty.id,
      Name: specialty.name,
    })),
  });
}