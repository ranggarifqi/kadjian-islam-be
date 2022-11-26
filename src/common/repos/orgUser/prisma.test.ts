import { Credential, Organisation, OrgUser, User } from '@prisma/client';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { TestFactory } from 'src/common/testUtil/factories';
import { getIntegrationTestingModule } from 'src/common/testUtil/getTestingApp';
import * as factories from 'src/common/testUtil/factories';
import { truncateTables } from 'src/common/testUtil/teardown';
import { Dict } from 'src/common/types';

import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaOrgUserRepository } from './prisma.repository';
import { EAccessLevel } from '../credential';

describe('PrismaOrgUserRepository Integration Test', () => {
  let repository: PrismaOrgUserRepository;
  let prismaService: PrismaService;

  let userFactory: TestFactory<User>;
  let credentialFactory: TestFactory<Credential>;
  let orgFactory: TestFactory<Organisation>;
  let orgUserFactory: TestFactory<OrgUser>;

  const seeds: Dict<any> = {};

  beforeEach(async () => {
    const module = await getIntegrationTestingModule({
      providers: [PrismaService, PrismaOrgUserRepository],
    });

    prismaService = module.get(PrismaService);

    repository = module.get(PrismaOrgUserRepository);

    userFactory = new factories.UserFactory(prismaService);
    credentialFactory = new factories.CredentialFactory(prismaService);
    orgFactory = new factories.OrganisationFactory(prismaService);
    orgUserFactory = new factories.OrgUserFactory(prismaService);

    seeds.credential = await credentialFactory.create({
      verifiedAt: null,
      accessLevel: EAccessLevel.USER,
    });
    seeds.user = await userFactory.create({
      id: seeds.credential.id,
      credentialId: seeds.credential.id,
    });
  });

  afterEach(async () => {
    await truncateTables(prismaService);
  });

  describe('selectOrgByMainKey', () => {
    beforeEach(async () => {
      seeds.organisation1 = await orgFactory.create({
        createdBy: seeds.user.id,
      });
      seeds.orgUser1 = await orgUserFactory.create({
        organisationId: seeds.organisation1.id,
        userId: seeds.user.id,
        isSelected: true,
      });

      seeds.organisation2 = await orgFactory.create({
        createdBy: seeds.user.id,
      });
      seeds.orgUser2 = await orgUserFactory.create({
        organisationId: seeds.organisation2.id,
        userId: seeds.user.id,
        isSelected: false,
      });
    });

    it('should set selected = true according to the given orgId, and make the others to false', async () => {
      const result = await repository.selectOrgByMainKey(
        seeds.user.id,
        seeds.organisation2.id,
      );

      expect(result).toHaveLength(2);

      const resultByOrgId = _.keyBy(result, 'organisationId');
      expect(resultByOrgId[seeds.organisation1.id].isSelected).toBeFalsy();
      expect(resultByOrgId[seeds.organisation2.id].isSelected).toBeTruthy();
    });

    it('should throw error if userId - orgId combination not found', async () => {
      let error: Error | undefined;
      try {
        await repository.selectOrgByMainKey(seeds.user.id, uuidv4());
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();

      const orgUsers = await prismaService.orgUser.findMany();
      expect(orgUsers).toHaveLength(2);

      /** Transaction should rollback the updated value */
      const resultByOrgId = _.keyBy(orgUsers, 'organisationId');
      expect(resultByOrgId[seeds.organisation1.id].isSelected).toBeTruthy();
      expect(resultByOrgId[seeds.organisation2.id].isSelected).toBeFalsy();
    });
  });
});
