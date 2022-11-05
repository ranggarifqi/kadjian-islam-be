import { PrismaService } from 'src/prisma/prisma.service';

export const truncateTables = async (prismaService: PrismaService) => {
  const tablenames = await prismaService.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prismaService.$executeRawUnsafe(`TRUNCATE TABLE ${tables};`);
  } catch (error) {
    console.log({ error });
  }
};
