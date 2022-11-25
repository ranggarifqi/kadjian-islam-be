import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

import {
  BaseOrgRequestRepo,
  EOrgRequestStatus,
} from 'src/common/repos/orgRequest';
import { MockOrgRequestRepository } from 'src/common/repos/orgRequest';
import { OrgCreationService } from './orgCreation.service';
import { Dict } from 'src/common/types';
import { BasePhoneService, LibPhoneNumberService } from 'src/common/phone';
import { RegisterOrgDto } from '../organisation.dto';

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
          provide: BasePhoneService,
          useClass: LibPhoneNumberService,
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
      const payload: RegisterOrgDto = {
        name: 'Test Org',
        description: 'Test Org Description',
        address: 'Test Org Address',
        email: 'test.org@ranggarifqi.com',
        mobileNumber: '+62812333123',
        size: 50,
        provinceId: '11',
        districtId: '1111',
      };
      await service.createOrgRequest(payload, creatorId);

      expect(stubs.create).toBeCalledWith(
        {
          name: 'Test Org',
          description: 'Test Org Description',
          address: 'Test Org Address',
          email: 'test.org@ranggarifqi.com',
          mobileNumber: '812333123',
          countryCode: '+62',
          size: 50,
          provinceId: '11',
          districtId: '1111',
        },
        creatorId,
      );
    });
  });

  describe('rejectOrgRequest()', () => {
    beforeEach(async () => {
      stubs.findById = jest.spyOn(orgRequestRepo, 'findById');
      stubs.updatedById = jest.spyOn(orgRequestRepo, 'updateById');
    });

    it('should throw 404 if no data found', async () => {
      stubs.findById.mockResolvedValue(null);

      let err: Error | undefined;

      try {
        await service.rejectOrgRequest(
          'someorgreqid',
          'someuserid',
          'Some reason',
        );
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err?.message).toBe(
        `Organisation Request with id someorgreqid not found`,
      );
    });

    it('should return the updated org request value', async () => {
      const result = await service.rejectOrgRequest(
        'someorgreqid',
        'someuserid',
        'Some reason',
      );

      expect(result.status).toBe(EOrgRequestStatus.REJECTED);
      expect(result.handledBy).toBe('someuserid');
      expect(result.handledAt).toStrictEqual(new Date());
      expect(result.rejectionReason).toBe('Some reason');
    });
  });

  describe('approveOrgRequest()', () => {
    beforeEach(() => {
      stubs.findById = jest.spyOn(orgRequestRepo, 'findById');
      stubs.approveById = jest.spyOn(orgRequestRepo, 'approveById');
    });

    it('should return 404 if no org request found', async () => {
      stubs.findById.mockResolvedValue(null);

      let err: Error | undefined;
      try {
        await service.approveOrgRequest('someorgreqid', 'approverid');
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err?.message).toBe(
        `Organisation Request with id someorgreqid not found`,
      );
    });

    it('should return an object of IOrgRequest', async () => {
      const result = await service.approveOrgRequest(
        'someorgreqid',
        'approverid',
      );

      expect(result.status).toBe(EOrgRequestStatus.APPROVED);
      expect(result.handledBy).toBe('approverid');
      expect(result.handledAt).toStrictEqual(new Date());

      expect(stubs.approveById).toHaveBeenCalledWith(
        'someorgreqid',
        'approverid',
      );
    });
  });
});
