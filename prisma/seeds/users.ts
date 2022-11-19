import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { SeederFunction } from '.';

export const seedDefaultAdmin: SeederFunction = async (
  prismaClient: PrismaClient,
) => {
  const adminPass = await bcrypt.hash('admin123', 10);

  const uuid = uuidv4();

  await prismaClient.credential.upsert({
    where: {
      email: 'admin@ranggarifqi.com',
    },
    update: {},
    create: {
      id: uuid,
      email: 'admin@ranggarifqi.com',
      password: adminPass,
      verifyToken: null,
      verifiedAt: new Date(),
      accessLevel: 'Admin',
      User: {
        create: {
          id: uuid,
          firstName: 'Mimin',
          lastName: 'Sarimin',
        },
      },
    },
  });

  console.log('Default admin upserted');
};
