import { Credential } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from 'src/prisma/prisma.service';
import { TestFactory } from './factory';

export class CredentialFactory extends TestFactory<Credential> {
  static getDummyData = (data?: Partial<Credential>): Credential => {
    return {
      id: uuidv4(),
      email: faker.internet.email(),
      password: faker.random.alphaNumeric(10),
      verifyToken: faker.random.alphaNumeric(10),
      verifiedAt: null,
      ...data,
    };
  };

  constructor(private prismaService: PrismaService) {
    super();
  }

  create(data?: Partial<Credential>): Promise<Credential> {
    const dummyData = CredentialFactory.getDummyData();
    return this.prismaService.credential.create({
      data: {
        ...dummyData,
        ...data,
      },
    });
  }
}
