import type { PrismaClient } from "@prisma/client";

import { tests } from "./constants";

export async function seedTests(prisma: PrismaClient) {
  await prisma.test.createMany({
    data: tests.map((test) => ({
      Id: test.id,
      Name: test.name,
    })),
  });
}