import { PrismaClient } from '@prisma/client';
import { seedDefaultAdmin } from './users';

const prisma = new PrismaClient();

export interface SeederFunction {
  (prismaClient: PrismaClient): Promise<void>;
}

const main = async () => {
  const seederFuncs: SeederFunction[] = [seedDefaultAdmin];

  for (const seederFunc of seederFuncs) {
    await seederFunc(prisma);
  }

  console.log('Successfully seeded default data');
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
