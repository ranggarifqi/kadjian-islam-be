import { Test, TestingModule } from '@nestjs/testing';
import { Credential } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

import { truncateTables } from 'src/common/testUtil/teardown';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CredentialFactory,
  TestFactory,
  UserFactory,
} from 'src/common/testUtil/factories';
import { Dict } from 'src/common/types';
import { PrismaUserRepository } from './prisma.repository';
import { EGender } from './userRepo.interface';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: PrismaService;

  let credentialFactory: TestFactory<Credential>;

  const seeds: Dict<any> = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, PrismaUserRepository],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);

    prismaService = module.get<PrismaService>(PrismaService);

    credentialFactory = new CredentialFactory(prismaService);
  });

  afterEach(async () => {
    truncateTables(prismaService);
  });

  describe('create()', () => {
    beforeEach(async () => {
      seeds.credential = await credentialFactory.create();
    });

    it('should create user successfully', async () => {
      const before = await prismaService.user.findMany();
      expect(before).toHaveLength(0);

      const dummyUser = await UserFactory.getDummyData({
        id: seeds.credential.id,
        credentialId: seeds.credential.id,
        gender: EGender.AKHWAT,
        provinceId: null,
        districtId: null,
      });
      const result = await repository.create({
        ...dummyUser,
      });

      expect(result.id).toBe(seeds.credential.id);
      expect(result.provinceId).toBeNull();
      expect(result.districtId).toBeNull();
      expect(result.firstName).toBe(dummyUser.firstName);
      expect(result.lastName).toBe(dummyUser.lastName);
      expect(result.gender).toBe(dummyUser.gender);
      expect(result.credentialId).toBe(seeds.credential.id);
      expect(result.createdAt).not.toBeNull();
      expect(result.updatedAt).not.toBeNull();

      const after = await prismaService.user.findMany();
      expect(after).toHaveLength(1);
      expect(after[0].id).toStrictEqual(result.id);
      expect(after[0].firstName).toStrictEqual(result.firstName);
    });

    it('should create user with related foreign key', async () => {
      const before = await prismaService.user.findMany();
      expect(before).toHaveLength(0);

      const dummyUser = await UserFactory.getDummyData({
        id: seeds.credential.id,
        credentialId: seeds.credential.id,
        gender: EGender.AKHWAT,
        provinceId: '11',
        districtId: '1101',
      });
      const result = await repository.create({
        ...dummyUser,
      });

      expect(result.provinceId).toBe('11');
      expect(result.districtId).toBe('1101');

      const after = await prismaService.user.findMany();
      expect(after).toHaveLength(1);
    });

    it('should throw error if related foreign key are not exist', async () => {
      const dummyUser = await UserFactory.getDummyData({
        id: seeds.credential.id,
        credentialId: seeds.credential.id,
        gender: EGender.AKHWAT,
        provinceId: 'asd',
        districtId: 'zzz',
      });

      try {
        await repository.create({
          ...dummyUser,
        });
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
      }
    });
  });
});
