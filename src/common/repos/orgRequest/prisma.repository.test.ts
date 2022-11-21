import { Test, TestingModule } from '@nestjs/testing';
import { User, Credential } from '@prisma/client';
import { TestFactory } from 'src/common/testUtil/factories';
import * as factories from 'src/common/testUtil/factories';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrgRequestPrismaRepository } from './prisma.repository';
import { truncateTables } from 'src/common/testUtil/teardown';
import { Dict } from 'src/common/types';
import {
  EOrgRequestStatus,
  IOrgRequestCreation,
} from './createOrgRequestRepo.interface';

describe('OrgRequestPrismaRepository Integration Tests', () => {
  let repository: OrgRequestPrismaRepository;
  let prismaService: PrismaService;

  let userFactory: TestFactory<User>;
  let credentialFactory: TestFactory<Credential>;

  const seeds: Dict<any> = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, OrgRequestPrismaRepository],
    }).compile();

    repository = module.get<OrgRequestPrismaRepository>(
      OrgRequestPrismaRepository,
    );

    prismaService = module.get<PrismaService>(PrismaService);

    credentialFactory = new factories.CredentialFactory(prismaService);
    userFactory = new factories.UserFactory(prismaService);

    seeds.credential = await credentialFactory.create({});
    seeds.user = await userFactory.create({
      id: seeds.credential.id,
      credentialId: seeds.credential.id,
    });
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await truncateTables(prismaService);
  });

  describe('create()', () => {
    it('should create a new org request', async () => {
      const payload: IOrgRequestCreation = {
        name: 'Test Org',
        description: 'Test Org Description',
        address: 'Test Org Address',
        mobileNumber: '812312312313',
        countryCode: '+65',
        provinceId: '11',
        districtId: '1111',
        email: 'test.org@ranggarifqi.com',
        size: 10,
      };
      const result = await repository.create(payload, seeds.credential.id);

      const {
        id,
        createdAt,
        createdBy,
        updatedAt,
        handledAt,
        handledBy,
        logo,
        rejectionReason,
        status,
        ...rest
      } = result;

      expect(rest).toStrictEqual(payload);
      expect(status).toBe(EOrgRequestStatus.PENDING);
      expect(createdBy).toBe(seeds.credential.id);

      expect(handledAt).toBeNull();
      expect(handledBy).toBeNull();
      expect(rejectionReason).toBeNull();
      expect(logo).toBeNull();

      expect(id).not.toBeNull();
      expect(createdAt).not.toBeNull();
      expect(updatedAt).not.toBeNull();
    });
  });
});
