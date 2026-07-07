import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import { seedAttempts } from "./attempts.seed";
import { seedCases } from "./cases.seed";
import { seedDailyCases } from "./daily-case.seed";
import { seedDiagnoses } from "./diagnoses.seed";
import { seedSpecialties } from "./specialties.seed";
import { seedTests } from "./tests.seed";
import { seedTreatments } from "./treatments.seed";
import { seedUsers } from "./users.seed";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the Prisma seed script.");
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function clearDatabase() {
  await prisma.attemptTest.deleteMany();
  await prisma.attemptTreatment.deleteMany();
  await prisma.userAttempt.deleteMany();
  await prisma.dailyCase.deleteMany();
  await prisma.caseImage.deleteMany();
  await prisma.caseTest.deleteMany();
  await prisma.caseTreatment.deleteMany();
  await prisma.case.deleteMany();
  await prisma.user.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.test.deleteMany();
  await prisma.treatment.deleteMany();
}

async function main() {
  await clearDatabase();

  await seedUsers(prisma);
  await seedSpecialties(prisma);
  await seedDiagnoses(prisma);
  await seedTests(prisma);
  await seedTreatments(prisma);
  await seedCases(prisma);
  await seedDailyCases(prisma);
  await seedAttempts(prisma);
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });