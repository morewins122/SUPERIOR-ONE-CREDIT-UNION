import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import {
  AccountType,
  CardStatus,
  Direction,
  LoanStatus,
  PrismaClient,
  Role,
  TransactionType
} from "@prisma/client";

const prisma = new PrismaClient();

const makeAccountNumber = (type: AccountType) => {
  const prefix = type === AccountType.CHECKING ? "11" : type === AccountType.SAVINGS ? "22" : "33";
  return `${prefix}${faker.string.numeric(8)}`;
};

const randomAmount = (min: number, max: number) => Number(faker.finance.amount({ min, max, dec: 2 }));

const april2025Date = (offset: number) => {
  const date = new Date("2025-04-30T18:00:00.000Z");
  date.setDate(date.getDate() - (offset % 30));
  date.setHours(18 - (offset % 9), (offset * 7) % 60, 0, 0);
  return date;
};

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.card.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@superioronecu.com",
      phone: "555-000-0000",
      passwordHash: adminHash,
      role: Role.ADMIN,
      emailVerified: true,
      twoFactorEnabled: true,
      notificationPreferences: { email: true, sms: false, push: true, weeklySummary: true }
    }
  });

  const users = [] as Array<{ id: string }>;

  for (let i = 0; i < 100; i += 1) {
    const passwordHash = await bcrypt.hash("User12345!", 10);
    const user = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        passwordHash,
        role: Role.USER,
        emailVerified: faker.datatype.boolean(0.8),
        twoFactorEnabled: faker.datatype.boolean(0.35),
        notificationPreferences: {
          email: faker.datatype.boolean(),
          sms: faker.datatype.boolean(),
          push: faker.datatype.boolean(),
          weeklySummary: faker.datatype.boolean()
        }
      }
    });
    users.push({ id: user.id });
  }

  const allUsers = [admin, ...(await prisma.user.findMany({ where: { role: Role.USER } }))];

  const accountIds: Array<{ id: string; userId: string }> = [];

  for (let i = 0; i < 300; i += 1) {
    const owner = faker.helpers.arrayElement(allUsers);
    const type = faker.helpers.arrayElement([AccountType.CHECKING, AccountType.SAVINGS, AccountType.FIXED_DEPOSIT]);
    const account = await prisma.account.create({
      data: {
        userId: owner.id,
        type,
        accountNumber: makeAccountNumber(type),
        balance: randomAmount(200, 50000)
      }
    });
    accountIds.push({ id: account.id, userId: owner.id });
  }

  for (let i = 0; i < 5000; i += 1) {
    const from = faker.helpers.arrayElement(accountIds);
    const to = faker.helpers.arrayElement(accountIds.filter((a) => a.id !== from.id && a.userId === from.userId));
    const type = faker.helpers.arrayElement([
      TransactionType.DEPOSIT,
      TransactionType.WITHDRAWAL,
      TransactionType.TRANSFER,
      TransactionType.CARD_PAYMENT
    ]);

    const amount = randomAmount(5, 2500);

    await prisma.transaction.create({
      data: {
        userId: from.userId,
        accountId: from.id,
        toAccountId: type === TransactionType.TRANSFER && to ? to.id : null,
        type,
        direction: type === TransactionType.DEPOSIT ? Direction.CREDIT : Direction.DEBIT,
        amount,
        description: faker.helpers.arrayElement([
          "Grocery purchase",
          "ATM withdrawal",
          "Payroll deposit",
          "Internal transfer",
          "Subscription payment",
          "Restaurant bill"
        ]),
        createdAt: april2025Date(i)
      }
    });
  }

  const usersForExtras = await prisma.user.findMany({ include: { accounts: true } });

  for (const user of usersForExtras) {
    const account = user.accounts[0];
    if (account) {
      await prisma.card.create({
        data: {
          userId: user.id,
          accountId: account.id,
          last4: faker.finance.creditCardNumber("####").slice(-4),
          expiryMonth: String(faker.number.int({ min: 1, max: 12 })).padStart(2, "0"),
          expiryYear: String(new Date().getFullYear() + faker.number.int({ min: 2, max: 6 })),
          isFrozen: faker.datatype.boolean(0.15),
          status: CardStatus.ACTIVE
        }
      });

      await prisma.loan.create({
        data: {
          userId: user.id,
          type: faker.helpers.arrayElement(["PERSONAL", "AUTO", "MORTGAGE"]),
          amount: randomAmount(5000, 300000),
          termMonths: faker.helpers.arrayElement([12, 24, 36, 60, 180, 360]),
          annualRate: Number(faker.finance.amount({ min: 3, max: 12, dec: 2 })),
          status: faker.helpers.arrayElement([
            LoanStatus.PENDING,
            LoanStatus.APPROVED,
            LoanStatus.ACTIVE,
            LoanStatus.REJECTED
          ])
        }
      });

      await prisma.notification.createMany({
        data: [
          {
            userId: user.id,
            title: "Welcome to Superior One",
            message: "Your account is ready. Explore your digital banking services.",
            isRead: faker.datatype.boolean()
          },
          {
            userId: user.id,
            title: "Security Notice",
            message: "Enable two-factor authentication for stronger account protection.",
            isRead: faker.datatype.boolean()
          }
        ]
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "SEED_INIT",
          entity: "User",
          metadata: { seededAt: new Date().toISOString() }
        }
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log("Seed completed: 100+ users, 300 accounts, 5000 transactions.");
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
