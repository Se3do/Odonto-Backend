import type { PrismaClient } from "@prisma/client";

import { users } from "./constants";

export async function seedUsers(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: users.map((user) => ({
      Id: user.id,
      UserName: user.userName,
      Email: user.email,
      PasswordHash: user.passwordHash,
      Role: user.Role,
      XpTotal: user.xpTotal,
      CurrentStreak: user.currentStreak,
      LongestStreak: user.longestStreak,
      LastCompletedDate: user.lastCompletedDate,
    })),
  });
}