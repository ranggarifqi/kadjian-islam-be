import { Test, TestingModule } from '@nestjs/testing';
import { Credential } from '@prisma/client';
import * as factory from 'src/common/testUtil/factories';
import { TestFactory } from 'src/common/testUtil/factories';
import { truncateTables } from 'src/common/testUtil/teardown';
import { Dict } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICredential } from './credentialRepo.interface';
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
      const EMAIL = 'fulan@ranggarifqi.com';
      const PASSWORD = 'somehashedpassword';
      const VERIFY_TOKEN = 'someToken';

      const before = await prismaService.user.findMany();
      expect(before).toHaveLength(0);

      const result = await repository.create({
        email: EMAIL,
        password: PASSWORD,
        verifyToken: VERIFY_TOKEN,
      });

      const after = await prismaService.credential.findMany();
      expect(after).toHaveLength(1);
      expect(after[0].email).toBe(EMAIL);
      expect(after[0].password).toBe(PASSWORD);
      expect(after[0].verifyToken).toBe(VERIFY_TOKEN);
      expect(after[0].verifiedAt).toBeNull();

      expect(result.id).toBe(after[0].id);
      expect(result.email).toBe(EMAIL);
      expect(result.password).toBe(PASSWORD);
      expect(result.verifyToken).toBe(VERIFY_TOKEN);
      expect(result.verifiedAt).toBeNull();
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
