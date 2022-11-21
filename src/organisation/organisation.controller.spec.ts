import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { getTestingApp } from 'src/common/testUtil/getTestingApp';
import { Dict } from 'src/common/types';
import { OrganisationController } from './organisation.controller';
import { RegisterOrgDto } from './organisation.dto';
import { MockOrgCreationService } from './orgCreation/mock.service';
import { BaseOrgCreationService } from './orgCreation/orgCreation.interface';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { getMockJWTToken } from 'src/common/testUtil/getMockJWTToken';
import { EAccessLevel } from 'src/common/repos/credential';
import { MySupertest } from 'src/common/testUtil/supertest';
import { ErrorResponse } from 'src/common/response';

describe('OrganisationController', () => {
  const BASE_ENDPOINT_URL = '/organisations';

  let server: INestApplication;
  let mySuperTest: MySupertest;

  const seeds: Dict<any> = {};

  // let controller: OrganisationController;
  // let orgCreationService: BaseOrgCreationService;
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

    // controller = module.get<OrganisationController>(OrganisationController);

    // orgCreationService = module.get<BaseOrgCreationService>(
    //   BaseOrgCreationService,
    // );
    jwtService = module.get<JwtService>(JwtService);

    mySuperTest = new MySupertest(server, BASE_ENDPOINT_URL);
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

      seeds.jwt = await getMockJWTToken(jwtService, {
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
  });
});
