import {
  CreateOrganisationRequest,
  Credential,
  Prisma,
  User,
} from '@prisma/client';
import { TestFactory } from 'src/common/testUtil/factories';
import * as factories from 'src/common/testUtil/factories';
import { getIntegrationTestingModule } from 'src/common/testUtil/getTestingApp';
import { truncateTables } from 'src/common/testUtil/teardown';
import { Dict } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseOrganisationRepository } from './organisation.interface';
import { PrismaOrganisationRepository } from './prisma.repository';
import { EOrgUserRole } from '../orgUser/orgUser.interface';

describe('PrismaOrganisationRepository Integration Test', () => {
  let prismaService: PrismaService;

  let repository: BaseOrganisationRepository<Prisma.TransactionClient>;

  let userFactory: TestFactory<User>;
  let credentialFactory: TestFactory<Credential>;
  let orgRequestFactory: TestFactory<CreateOrganisationRequest>;

  const seeds: Dict<any> = {};

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-11-22'));

    const module = await getIntegrationTestingModule({
      providers: [
        PrismaService,
        {
          provide: BaseOrganisationRepository,
          useClass: PrismaOrganisationRepository,
        },
      ],
    });

    repository = module.get<
      BaseOrganisationRepository<Prisma.TransactionClient>
    >(BaseOrganisationRepository);

    prismaService = module.get<PrismaService>(PrismaService);

    credentialFactory = new factories.CredentialFactory(prismaService);
    userFactory = new factories.UserFactory(prismaService);
    orgRequestFactory = new factories.OrgRequestFactory(prismaService);

    seeds.credential = await credentialFactory.create();
    seeds.user = await userFactory.create({
      id: seeds.credential.id,
      credentialId: seeds.credential.id,
    });
    seeds.orgRequest = await orgRequestFactory.create({
      createdBy: seeds.user.id,
    });
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await truncateTables(prismaService);
  });

  describe('createWithUser()', () => {
    it('should create organisation with user as admin', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rejectionReason, status, handledAt, handledBy, ...orgs } =
        seeds.orgRequest as CreateOrganisationRequest;

      const result = await repository.createWithUser(orgs);

      expect(result.name).toBe(orgs.name);
      expect(result.OrgUsers).toBeDefined();
      expect(result.OrgUsers).toHaveLength(1);

      const organisation = await prismaService.organisation.findFirst({
        where: { id: result.id },
      });
      expect(organisation).not.toBeNull();
      expect(organisation?.name).toBe(result.name);
      expect(organisation?.createdBy).toBe(result.createdBy);
      expect(organisation?.updatedBy).toBe(result.updatedBy);
      expect(organisation?.requestId).toBe(result.requestId);

      const orgUsers = await prismaService.orgUser.findMany();
      expect(orgUsers).toHaveLength(1);
      expect(orgUsers[0].userId).toBe(seeds.user.id);
      expect(orgUsers[0].organisationId).toBe(result.id);
      expect(orgUsers[0].isSelected).toBe(true);
      expect(orgUsers[0].orgUserRole).toBe(EOrgUserRole.ADMIN);
    });
  });
});
