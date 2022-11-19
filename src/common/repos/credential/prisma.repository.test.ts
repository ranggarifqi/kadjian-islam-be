import { Test, TestingModule } from '@nestjs/testing';
import { Credential } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

import * as factory from 'src/common/testUtil/factories';
import {
  CredentialFactory,
  TestFactory,
  UserFactory,
} from 'src/common/testUtil/factories';
import { truncateTables } from 'src/common/testUtil/teardown';
import { Dict } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { EAccessLevel, ICredential } from './credentialRepo.interface';
import { PrismaCredentialRepository } from './prisma.repository';

describe('PrismaCredentialRepository Integration Tests', () => {
  let repository: PrismaCredentialRepository;
  let prismaService: PrismaService;

  let credentialFactory: TestFactory<Credential>;

  const seeds: Dict<any> = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, PrismaCredentialRepository],
    }).compile();

    repository = module.get<PrismaCredentialRepository>(
      PrismaCredentialRepository,
    );

    prismaService = module.get<PrismaService>(PrismaService);

    credentialFactory = new factory.CredentialFactory(prismaService);
  });

  afterEach(async () => {
    await truncateTables(prismaService);
  });

  describe('findOne()', () => {
    const seeds: Dict<any> = {};

    beforeEach(async () => {
      seeds.credential = await credentialFactory.create({
        email: 'fulan@ranggarifqi.com',
        password: 'somehashedpassword',
        verifyToken: 'someToken',
      });
    });

    it('should return found data correctly', async () => {
      const result = await repository.findOne({
        verifyToken: 'someToken',
      });

      expect(result).not.toBeNull();
      expect(result).toStrictEqual({
        id: seeds.credential.id,
        email: seeds.credential.email,
        password: seeds.credential.password,
        verifiedAt: null,
        verifyToken: seeds.credential.verifyToken,
      } as ICredential);
    });

    it('should return null if data not found', async () => {
      const result = await repository.findOne({
        verifyToken: 'aasdsadsad',
      });

      expect(result).toBeNull();
    });
  });

  describe('create()', () => {
    it('should create data successfully', async () => {
      const dummyCredential = CredentialFactory.getDummyData();
      const dummyUser = UserFactory.getDummyData();

      const before = await prismaService.credential.findMany();
      expect(before).toHaveLength(0);

      const result = await repository.create({
        id: dummyCredential.id,
        email: dummyCredential.email,
        password: dummyCredential.password,
        verifyToken: dummyCredential.verifyToken,
        accessLevel: EAccessLevel.USER,
        user: {
          id: dummyCredential.id,
          firstName: dummyUser.firstName,
          lastName: dummyUser.lastName,
          gender: dummyUser.gender,
          provinceId: dummyUser.provinceId,
          districtId: dummyUser.districtId,
        },
      });

      const after = await prismaService.credential.findMany();
      expect(after).toHaveLength(1);
      expect(after[0].email).toBe(dummyCredential.email);
      expect(after[0].password).toBe(dummyCredential.password);
      expect(after[0].verifyToken).toBe(dummyCredential.verifyToken);
      expect(after[0].verifiedAt).toBeNull();

      expect(result.id).toBe(after[0].id);
      expect(result.email).toBe(dummyCredential.email);
      expect(result.password).toBe(dummyCredential.password);
      expect(result.verifyToken).toBe(dummyCredential.verifyToken);
      expect(result.verifiedAt).toBeNull();
    });

    it('should create related user data', async () => {
      const dummyCredential = CredentialFactory.getDummyData();
      const dummyUser = UserFactory.getDummyData();

      const before = await prismaService.user.findMany();
      expect(before).toHaveLength(0);

      const result = await repository.create({
        id: dummyCredential.id,
        email: dummyCredential.email,
        password: dummyCredential.password,
        verifyToken: dummyCredential.verifyToken,
        accessLevel: EAccessLevel.USER,
        user: {
          id: dummyCredential.id,
          firstName: dummyUser.firstName,
          lastName: dummyUser.lastName,
          gender: dummyUser.gender,
          provinceId: dummyUser.provinceId,
          districtId: dummyUser.districtId,
        },
      });

      const after = await prismaService.user.findMany();
      expect(after).toHaveLength(1);

      expect(after[0].id).toBe(result.User?.id);
      expect(after[0].firstName).toBe(result.User?.firstName);
      expect(after[0].lastName).toBe(result.User?.lastName);
      expect(after[0].gender).toBe(result.User?.gender);
      expect(after[0].provinceId).toBe(result.User?.provinceId);
      expect(after[0].districtId).toBe(result.User?.districtId);
      expect(after[0].credentialId).toBe(result.User?.credentialId);
    });

    it("should not create credential data if there's an error when inserting user", async () => {
      const dummyCredential = CredentialFactory.getDummyData();
      const dummyUser = UserFactory.getDummyData();

      const credBefore = await prismaService.credential.findMany();
      expect(credBefore).toHaveLength(0);

      const userBefore = await prismaService.user.findMany();
      expect(userBefore).toHaveLength(0);

      try {
        await repository.create({
          id: dummyCredential.id,
          email: dummyCredential.email,
          password: dummyCredential.password,
          verifyToken: dummyCredential.verifyToken,
          accessLevel: EAccessLevel.USER,
          user: {
            id: dummyCredential.id,
            firstName: dummyUser.firstName,
            lastName: dummyUser.lastName,
            gender: dummyUser.gender,
            provinceId: 'asd', // will throw error cos we don't currently have province with id = 'asd
            districtId: 'zzz',
          },
        });
      } catch (error) {
        expect(error).not.toBeUndefined();
        expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
      } finally {
        const credAfter = await prismaService.credential.findMany();
        expect(credAfter).toHaveLength(0);

        const userAfter = await prismaService.user.findMany();
        expect(userAfter).toHaveLength(0);
      }
    });
  });

  describe('updateAll()', () => {
    const VERIFY_TOKEN = 'someToken';

    beforeEach(async () => {
      seeds.credential = await credentialFactory.create({
        verifyToken: VERIFY_TOKEN,
      });
    });

    it('should update data successfully', async () => {
      const before = await prismaService.credential.findMany();

      expect(before).toHaveLength(1);
      expect(before[0].verifyToken).toBe(VERIFY_TOKEN);
      expect(before[0].verifiedAt).toBeNull();

      const VERIFIED_AT = new Date();

      await repository.updateAll(
        {
          verifyToken: VERIFY_TOKEN,
        },
        {
          verifyToken: null,
          verifiedAt: VERIFIED_AT,
        },
      );

      const after = await prismaService.credential.findMany();

      expect(after).toHaveLength(1);
      expect(after[0].verifyToken).toBeNull();
      expect(after[0].verifiedAt).toStrictEqual(VERIFIED_AT);
    });

    it('should not update if data not found', async () => {
      const before = await prismaService.credential.findMany();

      expect(before).toHaveLength(1);
      expect(before[0].verifyToken).toBe(VERIFY_TOKEN);
      expect(before[0].verifiedAt).toBeNull();

      const VERIFIED_AT = new Date();

      await repository.updateAll(
        {
          verifyToken: 'adasdasdasdasd',
        },
        {
          verifyToken: null,
          verifiedAt: VERIFIED_AT,
        },
      );

      const after = await prismaService.credential.findMany();

      expect(after).toHaveLength(1);
      expect(after[0].verifyToken).toBe(VERIFY_TOKEN);
      expect(after[0].verifiedAt).toBeNull();
    });
  });
});
