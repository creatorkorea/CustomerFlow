import bcrypt from "bcrypt";

import { prisma } from "../src/lib/db";

async function main() {
  const passwordHash = await bcrypt.hash(
    process.env["SEED_OWNER_PASSWORD"] ?? "customerflow-demo-password",
    12
  );

  await prisma.organization.upsert({
    where: { businessNumber: "000-00-00000" },
    update: {},
    create: {
      name: "CustomerFlow Demo",
      businessNumber: "000-00-00000",
      phone: "02-0000-0000",
      email: "owner@example.com",
      users: {
        create: {
          name: "홍길동",
          email: "owner@example.com",
          passwordHash,
          role: "owner"
        }
      },
      subscriptions: {
        create: {
          plan: "free",
          status: "trial",
          startedAt: new Date()
        }
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
