import { faker } from '@faker-js/faker';
import { CreateOrganisationRequest } from '@prisma/client';
import { EOrgRequestStatus } from 'src/common/repos/orgRequest';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { TestFactory } from './factory';

export class OrgRequestFactory extends TestFactory<CreateOrganisationRequest> {
  static getDummyData = (
    data?: Partial<CreateOrganisationRequest>,
  ): CreateOrganisationRequest => {
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
      createdBy: uuidv4(),
      updatedAt: new Date(),
      status: EOrgRequestStatus.PENDING,
      handledAt: null,
      handledBy: null,
      rejectionReason: null,
      ...data,
    };
  };

  constructor(private prismaService: PrismaService) {
    super();
  }

  create(
    data?: Partial<CreateOrganisationRequest> | undefined,
  ): Promise<CreateOrganisationRequest> {
    const dummyData = OrgRequestFactory.getDummyData(data);

    return this.prismaService.createOrganisationRequest.create({
      data: dummyData,
    });
  }
}
