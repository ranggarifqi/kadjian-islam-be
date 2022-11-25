import { faker } from '@faker-js/faker';
import { Organisation } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { TestFactory } from './factory';

export class OrganisationFactory extends TestFactory<Organisation> {
  static getDummyData = (data?: Partial<Organisation>): Organisation => {
    const createdBy = uuidv4();
    return {
      id: uuidv4(),
      name: faker.name.fullName(),
      description: faker.lorem.paragraph(),
      address: faker.address.streetAddress(),
      email: null,
      mobileNumber: faker.phone.number('############'),
      countryCode: '+62',
      provinceId: '11',
      districtId: '1111',
      size: 10,
      logo: null,
      createdAt: new Date(),
      createdBy: createdBy,
      updatedAt: new Date(),
      updatedBy: createdBy,
      requestId: uuidv4(),
      ...data,
    };
  };

  constructor(private prismaService: PrismaService) {
    super();
  }

  create(data?: Partial<Organisation> | undefined): Promise<Organisation> {
    const dummyData = OrganisationFactory.getDummyData(data);

    return this.prismaService.organisation.create({
      data: dummyData,
    });
  }
}
