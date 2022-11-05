import { PrismaService } from 'src/prisma/prisma.service';

export const truncateTables = async (prismaService: PrismaService) => {
  const allTableNames = await prismaService.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tableToPreserve: string[] = [
    '_prisma_migrations',
    'Province',
    'District',
  ];

  const tables = allTableNames
    .map(({ tablename }) => tablename)
    .filter((name) => !tableToPreserve.includes(name))
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prismaService.$executeRawUnsafe(`TRUNCATE TABLE ${tables};`);
  } catch (error) {
    console.log({ error });
  }
};
