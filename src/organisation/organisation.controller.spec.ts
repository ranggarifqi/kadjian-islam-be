import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { getTestingApp } from 'src/common/testUtil/getTestingApp';
import { Dict } from 'src/common/types';
import { OrganisationController } from './organisation.controller';
import { RegisterOrgDto, RejectOrgDto } from './organisation.dto';
import { MockOrgCreationService } from './orgCreation/mock.service';
import { BaseOrgCreationService } from './orgCreation/orgCreation.interface';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { getMockJWTToken } from 'src/common/testUtil/getMockJWTToken';
import { EAccessLevel } from 'src/common/repos/credential';
import { MySupertest } from 'src/common/testUtil/supertest';
import { ErrorResponse, SuccessResponse } from 'src/common/response';
import { IOrgRequest } from 'src/common/repos/orgRequest';

describe('OrganisationController', () => {
  const BASE_ENDPOINT_URL = '/organisations';

  let server: INestApplication;
  let mySuperTest: MySupertest;

  const seeds: Dict<any> = {};
  const spies: Dict<jest.SpyInstance> = {};

  let orgCreationService: BaseOrgCreationService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const { module, app } = await getTestingApp({
      imports: [AuthModule],
      controllers: [OrganisationController],
      providers: [
        JwtService,

        {
          provide: BaseOrgCreationService,
          useClass: MockOrgCreationService,
        },
      ],
    });

    server = app;

    await server.init();

    orgCreationService = module.get<BaseOrgCreationService>(
      BaseOrgCreationService,
    );
    jwtService = module.get<JwtService>(JwtService);

    mySuperTest = new MySupertest(server, BASE_ENDPOINT_URL);

    spies.createOrgRequest = jest.spyOn(orgCreationService, 'createOrgRequest');
  });

  describe('registerOrganisation()', () => {
    beforeEach(async () => {
      const payload: RegisterOrgDto = {
        name: 'Test Org',
        description: 'Test Org Description',
        address: 'Test Org Address',
        size: 50,
        mobileNumber: '+62123456789',
        provinceId: '11',
        districtId: '1111',
      };
      seeds.payload = payload;

      seeds.userId = 'someuserid';

      seeds.jwt = await getMockJWTToken(jwtService, {
        userId: seeds.userId,
        isVerified: true,
        accessLevel: EAccessLevel.USER,
      });
    });

    describe('test for auth', () => {
      it("should return 401 if user hasn't logged in", async () => {
        const result: request.Response = await mySuperTest.post('/register', {
          payload: seeds.payload,
        });

        expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it("should return 403 if user hasn't verified yet", async () => {
        const jwt = await getMockJWTToken(jwtService, {
          isVerified: false,
          accessLevel: EAccessLevel.USER,
        });
        const result: request.Response = await mySuperTest.post('/register', {
          jwt,
          payload: seeds.payload,
        });

        expect(result.statusCode).toBe(HttpStatus.FORBIDDEN);
      });
    });

    describe('test for payload', () => {
      it('should return 400 if phone number is not valid', async () => {
        seeds.payload.mobileNumber = 'asdsdadsa123';
        const result: request.Response = await mySuperTest.post('/register', {
          jwt: seeds.jwt,
          payload: seeds.payload,
        });

        const resultBody = result.body as ErrorResponse;

        expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(resultBody.error).toBe('Bad Request');
        expect(resultBody.message).toHaveLength(1);
        expect((resultBody.message as string[])[0]).toBe(
          'mobileNumber must be a valid phone number',
        );
      });
    });

    it('should return 201 on successful call', async () => {
      const result: request.Response = await mySuperTest.post('/register', {
        jwt: seeds.jwt,
        payload: seeds.payload,
      });

      expect(result.statusCode).toBe(HttpStatus.CREATED);

      const resultBody = result.body as SuccessResponse<IOrgRequest>;

      expect(resultBody.statusCode).toBe(HttpStatus.CREATED);
      expect(resultBody.message).toBe(
        'Organsation request submitted successfully',
      );

      expect(resultBody.data.createdBy).toBe(seeds.userId);

      expect(spies.createOrgRequest).toHaveBeenCalledWith(
        {
          name: 'Test Org',
          description: 'Test Org Description',
          address: 'Test Org Address',
          size: 50,
          mobileNumber: '+62123456789',
          provinceId: '11',
          districtId: '1111',
        },
        seeds.userId,
      );
    });
  });

  describe('reject()', () => {
    beforeEach(async () => {
      seeds.jwt = await getMockJWTToken(jwtService, {
        userId: seeds.userId,
        isVerified: true,
        accessLevel: EAccessLevel.ADMIN,
      });

      seeds.url = `/reject/someid`;

      spies.rejectOrgRequest = jest.spyOn(
        orgCreationService,
        'rejectOrgRequest',
      );
    });

    describe('test for auth', () => {
      it('should return 401 if not authenticated', async () => {
        const result: request.Response = await mySuperTest.patch(seeds.url);

        expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('should return 403 if not verified', async () => {
        const jwt = await getMockJWTToken(jwtService, {
          userId: seeds.userId,
          isVerified: false,
          accessLevel: EAccessLevel.ADMIN,
        });

        const result: request.Response = await mySuperTest.patch(seeds.url, {
          jwt,
        });

        expect(result.statusCode).toBe(HttpStatus.FORBIDDEN);
      });

      it('should return 403 if not an admin or moderator', async () => {
        const jwt = await getMockJWTToken(jwtService, {
          userId: seeds.userId,
          isVerified: true,
          accessLevel: EAccessLevel.USER,
        });

        const result: request.Response = await mySuperTest.patch(seeds.url, {
          jwt,
        });

        expect(result.statusCode).toBe(HttpStatus.FORBIDDEN);
      });

      it('should allow moderator', async () => {
        const jwt = await getMockJWTToken(jwtService, {
          userId: seeds.userId,
          isVerified: true,
          accessLevel: EAccessLevel.MODERATOR,
        });

        const result: request.Response = await mySuperTest.patch(seeds.url, {
          jwt,
        });

        expect(result.statusCode).toBe(HttpStatus.OK);
      });
    });

    it('should reject org request with reason', async () => {
      const result: request.Response = await mySuperTest.patch<RejectOrgDto>(
        seeds.url,
        {
          jwt: seeds.jwt,
          payload: { reason: 'Test Reason' },
        },
      );

      expect(result.statusCode).toBe(HttpStatus.OK);

      const resultBody = result.body as SuccessResponse<IOrgRequest>;

      expect(resultBody.message).toBe('Organisation rejected successfully');
      expect(resultBody.data.id).toBe('someid');
      expect(resultBody.data.handledBy).toBe(seeds.userId);
      expect(resultBody.data.rejectionReason).toBe('Test Reason');

      expect(spies.rejectOrgRequest).toHaveBeenCalledWith(
        'someid',
        seeds.userId,
        'Test Reason',
      );
    });

    it('should reject org request without reason', async () => {
      const result: request.Response = await mySuperTest.patch<RejectOrgDto>(
        seeds.url,
        {
          jwt: seeds.jwt,
        },
      );

      expect(result.statusCode).toBe(HttpStatus.OK);

      const resultBody = result.body as SuccessResponse<IOrgRequest>;

      expect(resultBody.message).toBe('Organisation rejected successfully');
      expect(resultBody.data.id).toBe('someid');
      expect(resultBody.data.handledBy).toBe(seeds.userId);
      expect(resultBody.data.rejectionReason).toBeUndefined();

      expect(spies.rejectOrgRequest).toHaveBeenCalledWith(
        'someid',
        seeds.userId,
        undefined,
      );
    });
  });

  describe('approve()', () => {
    beforeEach(async () => {
      seeds.jwt = await getMockJWTToken(jwtService, {
        userId: seeds.userId,
        isVerified: true,
        accessLevel: EAccessLevel.ADMIN,
      });

      seeds.url = `/approve/someid`;

      spies.approveOrgRequest = jest.spyOn(
        orgCreationService,
        'approveOrgRequest',
      );
    });

    describe('test for auth', () => {
      it('should return 401 if not authenticated', async () => {
        const result: request.Response = await mySuperTest.patch(seeds.url);

        expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it('should return 403 if not verified', async () => {
        const jwt = await getMockJWTToken(jwtService, {
          userId: seeds.userId,
          isVerified: false,
          accessLevel: EAccessLevel.ADMIN,
        });

        const result: request.Response = await mySuperTest.patch(seeds.url, {
          jwt,
        });

        expect(result.statusCode).toBe(HttpStatus.FORBIDDEN);
      });

      it('should return 403 if not an admin or moderator', async () => {
        const jwt = await getMockJWTToken(jwtService, {
          userId: seeds.userId,
          isVerified: true,
          accessLevel: EAccessLevel.USER,
        });

        const result: request.Response = await mySuperTest.patch(seeds.url, {
          jwt,
        });

        expect(result.statusCode).toBe(HttpStatus.FORBIDDEN);
      });

      it('should allow moderator', async () => {
        const jwt = await getMockJWTToken(jwtService, {
          userId: seeds.userId,
          isVerified: true,
          accessLevel: EAccessLevel.MODERATOR,
        });

        const result: request.Response = await mySuperTest.patch(seeds.url, {
          jwt,
        });

        expect(result.statusCode).toBe(HttpStatus.OK);
      });
    });

    it('should approve org request', async () => {
      const result: request.Response = await mySuperTest.patch(seeds.url, {
        jwt: seeds.jwt,
      });

      expect(result.statusCode).toBe(HttpStatus.OK);

      const resultBody = result.body as SuccessResponse<IOrgRequest>;

      expect(resultBody.message).toBe('Organisation approved successfully');
      expect(resultBody.data.id).toBe('someid');
      expect(resultBody.data.handledBy).toBe(seeds.userId);

      expect(spies.approveOrgRequest).toHaveBeenCalledWith(
        'someid',
        seeds.userId,
      );
    });
  });
});
