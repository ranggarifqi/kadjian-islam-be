import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

import {
  BaseOrgRequestRepo,
  IOrgRequestCreation,
} from 'src/common/repos/orgRequest';
import { MockOrgRequestRepository } from 'src/common/repos/orgRequest';
import { OrgCreationService } from './orgCreation.service';
import { Dict } from 'src/common/types';
import { HasherService, MockHasher } from 'src/common/hasher';

describe('org creation service', () => {
  let orgRequestRepo: BaseOrgRequestRepo;

  let service: OrgCreationService;

  const stubs: Dict<jest.SpyInstance> = {};

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2022, 10, 30));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BaseOrgRequestRepo,
          useClass: MockOrgRequestRepository,
        },

        {
          provide: HasherService,
          useClass: MockHasher,
        },

        OrgCreationService,
      ],
    }).compile();

    orgRequestRepo = module.get<BaseOrgRequestRepo>(BaseOrgRequestRepo);

    service = module.get<OrgCreationService>(OrgCreationService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createOrgRequest()', () => {
    beforeEach(() => {
      stubs.create = jest.spyOn(orgRequestRepo, 'create');
    });
    it('should call orgRequestRepo.create() once', async () => {
      const creatorId = uuidv4();
      const payload: IOrgRequestCreation = {
        name: 'Test Org',
        description: 'Test Org Description',
        address: 'Test Org Address',
        email: 'test.org@ranggarifqi.com',
        mobileNumber: '812333123',
        countryCode: '+62',
        size: 50,
        provinceId: '11',
        districtId: '1111',
      };
      await service.createOrgRequest(payload, creatorId);

      expect(stubs.create).toBeCalledWith(payload, creatorId);
    });
  });
});