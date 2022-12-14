import { Test, TestingModule } from '@nestjs/testing';
import { User, Credential, CreateOrganisationRequest } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { TestFactory } from 'src/common/testUtil/factories';
import * as factories from 'src/common/testUtil/factories';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrgRequestPrismaRepository } from './prisma.repository';
import { truncateTables } from 'src/common/testUtil/teardown';
import { Dict } from 'src/common/types';
import {
  EOrgRequestStatus,
  IOrgRequest,
  IOrgRequestCreation,
} from './createOrgRequestRepo.interface';
import { add } from 'date-fns';
import { getFakeTimer } from 'src/common/testUtil/getFakeTimer';
import {
  BaseOrganisationRepository,
  PrismaOrganisationRepository,
} from '../organisation';
import { EAccessLevel } from '../credential';
import { EOrgUserRole } from '../orgUser/orgUser.interface';

describe('OrgRequestPrismaRepository Integration Tests', () => {
  let repository: OrgRequestPrismaRepository;
  let prismaService: PrismaService;

  let userFactory: TestFactory<User>;
  let credentialFactory: TestFactory<Credential>;
  let orgRequestFactory: TestFactory<CreateOrganisationRequest>;

  const seeds: Dict<any> = {};

  beforeEach(async () => {
    getFakeTimer(new Date('2022-11-22'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        OrgRequestPrismaRepository,
        {
          provide: BaseOrganisationRepository,
          useClass: PrismaOrganisationRepository,
        },
      ],
    }).compile();

    repository = module.get<OrgRequestPrismaRepository>(
      OrgRequestPrismaRepository,
    );

    prismaService = module.get<PrismaService>(PrismaService);

    credentialFactory = new factories.CredentialFactory(prismaService);
    userFactory = new factories.UserFactory(prismaService);
    orgRequestFactory = new factories.OrgRequestFactory(prismaService);

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

  describe('findAll()', () => {
    beforeEach(async () => {
      seeds.orgRequest = await orgRequestFactory.create({
        createdBy: seeds.credential.id,
      });
    });

    it('should find all data', async () => {
      const result = await repository.findAll();

      expect(result).toHaveLength(1);

      expect(result[0].Creator).not.toBeUndefined();
      expect(result[0].Creator?.firstName).toBe(seeds.user.firstName);
      expect(result[0].Creator?.lastName).toBe(seeds.user.lastName);
      expect(result[0].Creator?.gender).toBeUndefined();

      expect(result[0].Province).not.toBeUndefined();
      expect(result[0].Province?.name).toBe('ACEH');
      expect(result[0].Province?.id).toBeUndefined;

      expect(result[0].District).not.toBeUndefined();
      expect(result[0].District?.name).toBe('KAB. BIREUEN');
      expect(result[0].District?.id).toBeUndefined;
    });

    it('should be sorted by created at DESC', async () => {
      const orgRequest2 = await orgRequestFactory.create({
        createdBy: seeds.credential.id,
        createdAt: add(new Date(), { days: 1 }),
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(orgRequest2.id);
      expect(result[1].id).toBe(seeds.orgRequest.id);
    });
  });

  describe('findById()', () => {
    beforeEach(async () => {
      seeds.orgRequest = await orgRequestFactory.create({
        createdBy: seeds.credential.id,
      });
    });

    it('should return data correctly', async () => {
      const result = await repository.findById(seeds.orgRequest.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(seeds.orgRequest.id);
    });

    it('should return null if data not found', async () => {
      const result = await repository.findById(uuidv4());

      expect(result).toBeNull();
    });
  });

  describe('updateById()', () => {
    beforeEach(async () => {
      seeds.orgRequest = await orgRequestFactory.create({
        createdBy: seeds.credential.id,
      });
    });

    it('should update correctly by id', async () => {
      const before = await prismaService.createOrganisationRequest.findMany();

      expect(before).toHaveLength(1);
      expect(before[0].status).toBe(EOrgRequestStatus.PENDING);
      expect(before[0].handledAt).toBeNull();
      expect(before[0].handledBy).toBeNull();
      expect(before[0].rejectionReason).toBeNull();

      const result = await repository.updateById(seeds.orgRequest.id, {
        status: EOrgRequestStatus.REJECTED,
        handledAt: new Date(),
        handledBy: seeds.user.id,
        rejectionReason: 'iseng',
      });

      const after = await prismaService.createOrganisationRequest.findFirst({
        where: { id: result.id },
      });

      expect(after).not.toBeNull();
      expect(after?.status).toBe(EOrgRequestStatus.REJECTED);
      expect(after?.handledAt).toStrictEqual(new Date());
      expect(after?.handledBy).toBe(seeds.user.id);
      expect(after?.rejectionReason).toBe('iseng');
    });

    it('should update correctly by id using transaction', async () => {
      const before = await prismaService.createOrganisationRequest.findMany();

      expect(before).toHaveLength(1);
      expect(before[0].status).toBe(EOrgRequestStatus.PENDING);
      expect(before[0].handledAt).toBeNull();
      expect(before[0].handledBy).toBeNull();
      expect(before[0].rejectionReason).toBeNull();

      let result: IOrgRequest | undefined;

      await prismaService.$transaction(async (transaction) => {
        result = await repository.updateById(
          seeds.orgRequest.id,
          {
            status: EOrgRequestStatus.REJECTED,
            handledAt: new Date(),
            handledBy: seeds.user.id,
            rejectionReason: 'iseng',
          },
          { transaction },
        );
      });

      expect(result).toBeDefined();

      const after = await prismaService.createOrganisationRequest.findFirst({
        where: { id: result!.id },
      });

      expect(after).not.toBeNull();
      expect(after?.status).toBe(EOrgRequestStatus.REJECTED);
      expect(after?.handledAt).toStrictEqual(new Date());
      expect(after?.handledBy).toBe(seeds.user.id);
      expect(after?.rejectionReason).toBe('iseng');
    });

    it('should throw error if ID not found', async () => {
      const before = await prismaService.createOrganisationRequest.findMany();

      expect(before).toHaveLength(1);
      expect(before[0].status).toBe(EOrgRequestStatus.PENDING);
      expect(before[0].handledAt).toBeNull();
      expect(before[0].handledBy).toBeNull();
      expect(before[0].rejectionReason).toBeNull();

      let error: Error | undefined;
      try {
        await repository.updateById(uuidv4(), {
          status: EOrgRequestStatus.REJECTED,
          handledAt: new Date(),
          handledBy: seeds.user.id,
          rejectionReason: 'iseng',
        });
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error?.message).toContain(
        'Invalid `this.prismaService.createOrganisationRequest.update()` invocation in',
      );
    });
  });

  describe('approveById()', () => {
    beforeEach(async () => {
      seeds.adminCred = await credentialFactory.create({
        accessLevel: EAccessLevel.ADMIN,
      });
      seeds.admin = await userFactory.create({
        id: seeds.adminCred.id,
        credentialId: seeds.adminCred.id,
      });
      seeds.orgRequest = await orgRequestFactory.create({
        createdBy: seeds.user.id,
      });
    });

    it('should approve by id correctly', async () => {
      const before = await prismaService.createOrganisationRequest.findMany();

      expect(before).toHaveLength(1);
      expect(before[0].status).toBe(EOrgRequestStatus.PENDING);
      expect(before[0].handledAt).toBeNull();
      expect(before[0].handledBy).toBeNull();
      expect(before[0].rejectionReason).toBeNull();

      const result = await repository.approveById(
        seeds.orgRequest.id,
        seeds.admin.id,
      );

      const after = await prismaService.createOrganisationRequest.findFirst({
        where: { id: result.id },
      });

      expect(after).not.toBeNull();
      expect(after?.status).toBe(EOrgRequestStatus.APPROVED);
      expect(after?.handledAt).toStrictEqual(new Date());
      expect(after?.handledBy).toBe(seeds.admin.id);
      expect(after?.rejectionReason).toBeNull();
    });

    it('should create organisation correctly', async () => {
      const before = await prismaService.organisation.findMany();
      expect(before).toHaveLength(0);

      await repository.approveById(seeds.orgRequest.id, seeds.admin.id);

      const after = await prismaService.organisation.findMany();
      expect(after).toHaveLength(1);
      expect(after[0].requestId).toBe(seeds.orgRequest.id);
      expect(after[0].createdBy).toBe(seeds.user.id);
      expect(after[0].updatedBy).toBe(seeds.user.id);
    });

    it('should create org user correctly', async () => {
      const before = await prismaService.orgUser.findMany();
      expect(before).toHaveLength(0);

      await repository.approveById(seeds.orgRequest.id, seeds.admin.id);

      const after = await prismaService.orgUser.findMany({
        include: {
          Organisation: true,
        },
      });
      expect(after).toHaveLength(1);
      expect(after[0].isSelected).toBeTruthy();
      expect(after[0].userId).toBe(seeds.user.id);
      expect(after[0].Organisation).toBeDefined();
      expect(after[0].Organisation.requestId).toBe(seeds.orgRequest.id);
      expect(after[0].orgUserRole).toBe(EOrgUserRole.ADMIN);
    });

    it('should throw error if ID not found', async () => {
      let error: Error | undefined;
      try {
        await repository.approveById(uuidv4(), seeds.admin.id);
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error?.message).toContain(
        'Invalid `transaction.createOrganisationRequest.update()` invocation in',
      );
    });
  });
});
