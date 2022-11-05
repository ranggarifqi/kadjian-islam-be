import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { TestFactory } from './factory';

export class UserFactory extends TestFactory<User> {
  static getDummyData = (data?: Partial<User>): User => {
    const id = uuidv4();
    return {
      id,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      credentialId: id,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
  };

  constructor(private prismaService: PrismaService) {
    super();
  }

  create(data?: Partial<User> | undefined): Promise<User> {
    const dummyData = UserFactory.getDummyData();

    return this.prismaService.user.create({
      data: {
        ...dummyData,
        ...data,
      },
    });
  }
}
