import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { ErrorResponse, SuccessResponse } from 'src/common/response';
import { getTestingApp } from 'src/common/testUtil/getTestingApp';
import { Dict } from 'src/common/types';

import { AuthController } from './auth.controller';
import { BaseAuthService } from './auth.interface';
import { MockAuthService } from './mock.service';
import { LoginDTO, RegisterUserDTO } from './auth.dto';
import { EGender } from 'src/common/repos/user';

describe('AuthController', () => {
  const BASE_ENDPOINT_URL = '/auth';

  let server: INestApplication;

  let controller: AuthController;
  let service: BaseAuthService;

  const spies: Dict<jest.SpyInstance> = {};
  const seeds: Dict<any> = {};

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2022, 10, 30));

    const { module, app } = await getTestingApp({
      controllers: [AuthController],
      providers: [
        {
          provide: BaseAuthService,
          useClass: MockAuthService,
        },
      ],
    });

    server = app;

    await server.init();

    controller = module.get<AuthController>(AuthController);
    service = module.get<BaseAuthService>(BaseAuthService);

    spies.registerUser = jest.spyOn(service, 'registerUser');
    spies.verifyUser = jest.spyOn(service, 'verifyUser');
    spies.login = jest.spyOn(service, 'login');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register()', () => {
    beforeEach(() => {
      const payload: RegisterUserDTO = {
        email: 'fulan@ranggarifqi.com',
        rawPassword: 'fulan123',
        firstName: 'Fulan',
        lastName: 'Alan',
        gender: EGender.IKHWAN,
      };
      seeds.payload = payload;
    });

    describe('payload test', () => {
      describe('email', () => {
        it('should return 400 if provided email value is empty', async () => {
          delete seeds.payload.email;

          const result: request.Response = await request(server.getHttpServer())
            .post(BASE_ENDPOINT_URL + '/register')
            .send(seeds.payload);

          const resultBody = result.body as ErrorResponse;

          expect(result.statusCode).toBe(400);
          expect(resultBody.error).toBe('Bad Request');
          expect(resultBody.message).toHaveLength(1);
          expect((resultBody.message as string[])[0]).toBe(
            'email must be an email',
          );
        });
        it('should return 400 if provided email value is not an email', async () => {
          seeds.payload.email = 'notanemail';

          const result: request.Response = await request(server.getHttpServer())
            .post(BASE_ENDPOINT_URL + '/register')
            .send(seeds.payload);

          const resultBody = result.body as ErrorResponse;

          expect(result.statusCode).toBe(400);
          expect(resultBody.error).toBe('Bad Request');
          expect(resultBody.message).toHaveLength(1);
          expect((resultBody.message as string[])[0]).toBe(
            'email must be an email',
          );
        });
      });

      describe('password', () => {
        it('should return 400 if empty', async () => {
          delete seeds.payload.rawPassword;

          const result: request.Response = await request(server.getHttpServer())
            .post(BASE_ENDPOINT_URL + '/register')
            .send(seeds.payload);

          const resultBody = result.body as ErrorResponse;

          expect(result.statusCode).toBe(400);
          expect(resultBody.error).toBe('Bad Request');
          expect(resultBody.message).toHaveLength(2);
          expect(resultBody.message).toEqual(
            expect.arrayContaining([
              'rawPassword must be longer than or equal to 6 characters',
              'rawPassword should not be empty',
            ]),
          );
        });

        it('should return 400 if < 6 characters', async () => {
          seeds.payload.rawPassword = '12345';

          const result: request.Response = await request(server.getHttpServer())
            .post(BASE_ENDPOINT_URL + '/register')
            .send(seeds.payload);

          const resultBody = result.body as ErrorResponse;

          expect(result.statusCode).toBe(400);
          expect(resultBody.error).toBe('Bad Request');
          expect(resultBody.message).toHaveLength(1);
          expect(resultBody.message).toEqual(
            expect.arrayContaining([
              'rawPassword must be longer than or equal to 6 characters',
            ]),
          );
        });
      });

      it('should return 400 if no firstName provided', async () => {
        delete seeds.payload.firstName;

        const result: request.Response = await request(server.getHttpServer())
          .post(BASE_ENDPOINT_URL + '/register')
          .send(seeds.payload);

        const resultBody = result.body as ErrorResponse;

        expect(result.statusCode).toBe(400);
        expect(resultBody.error).toBe('Bad Request');
        expect(resultBody.message).toHaveLength(1);
        expect(resultBody.message).toEqual(
          expect.arrayContaining(['firstName should not be empty']),
        );
      });

      it('should return 400 if no lastName provided', async () => {
        delete seeds.payload.lastName;

        const result: request.Response = await request(server.getHttpServer())
          .post(BASE_ENDPOINT_URL + '/register')
          .send(seeds.payload);

        const resultBody = result.body as ErrorResponse;

        expect(result.statusCode).toBe(400);
        expect(resultBody.error).toBe('Bad Request');
        expect(resultBody.message).toHaveLength(1);
        expect(resultBody.message).toEqual(
          expect.arrayContaining(['lastName should not be empty']),
        );
      });
    });

    it('should call auth service -> registerUser()', async () => {
      const result = await request(server.getHttpServer())
        .post(BASE_ENDPOINT_URL + '/register')
        .send(seeds.payload);

      expect(result.body).toStrictEqual({
        statusCode: HttpStatus.CREATED,
        message: `User registered successfully. Please check your email for verification link`,
        data: {
          id: 'someuuid',
          firstName: 'Fulan',
          lastName: 'Alan',
          gender: EGender.IKHWAN,
          provinceId: null,
          districtId: null,
          credentialId: 'somecredentialuuid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      expect(spies.registerUser).toHaveBeenCalledWith({
        email: 'fulan@ranggarifqi.com',
        rawPassword: 'fulan123',
        firstName: 'Fulan',
        lastName: 'Alan',
        gender: EGender.IKHWAN,
      });
    });
  });

  describe('verify()', () => {
    beforeEach(() => {
      process.env.VERIFY_USER_SUCCESS_URL = 'http://success.com';
      process.env.VERIFY_USER_FAILED_URL = 'http://failed.com';
    });

    afterEach(() => {
      delete process.env.VERIFY_USER_SUCCESS_URL;
      delete process.env.VERIFY_USER_FAILED_URL;
    });

    it('Should return 500 if no VERIFY_USER_SUCCESS_URL env found', async () => {
      delete process.env.VERIFY_USER_SUCCESS_URL;

      const result: request.Response = await request(
        server.getHttpServer(),
      ).get(BASE_ENDPOINT_URL + '/verify?token=sometoken');

      const resultBody = result.body as ErrorResponse;

      expect(result.statusCode).toBe(500);
      expect(resultBody.message).toEqual(
        'No env variable VERIFY_USER_SUCCESS_URL found',
      );
    });

    it('Should return 500 if no VERIFY_USER_FAILED_URL env found', async () => {
      delete process.env.VERIFY_USER_FAILED_URL;

      const result: request.Response = await request(
        server.getHttpServer(),
      ).get(BASE_ENDPOINT_URL + '/verify?token=sometoken');

      const resultBody = result.body as ErrorResponse;

      expect(result.statusCode).toBe(500);
      expect(resultBody.message).toEqual(
        'No env variable VERIFY_USER_FAILED_URL found',
      );
    });

    it('Should redirect to VERIFY_USER_SUCCESS_URL on validation success', async () => {
      const result: request.Response = await request(
        server.getHttpServer(),
      ).get(BASE_ENDPOINT_URL + '/verify?token=sometoken');

      expect(result.statusCode).toBe(302);
      expect(result.header['location']).toBe(
        process.env.VERIFY_USER_SUCCESS_URL,
      );
    });

    it('Should redirect to VERIFY_USER_FAILED_URL on validation failed', async () => {
      spies.verifyUser.mockResolvedValue(false);

      const result: request.Response = await request(
        server.getHttpServer(),
      ).get(BASE_ENDPOINT_URL + '/verify?token=randomstr');

      expect(result.statusCode).toBe(302);
      expect(result.header['location']).toBe(
        process.env.VERIFY_USER_FAILED_URL,
      );
    });
  });

  describe('login()', () => {
    beforeEach(() => {
      const payload: LoginDTO = {
        email: 'fulan@ranggarifqi.com',
        password: 'fulan123',
      };
      seeds.payload = payload;
    });

    describe('payload test', () => {
      it('should return 400 if no email provided', async () => {
        delete seeds.payload.email;

        const result: request.Response = await request(server.getHttpServer())
          .post(BASE_ENDPOINT_URL + '/login')
          .send(seeds.payload);

        const resultBody = result.body as ErrorResponse;

        expect(result.statusCode).toBe(400);
        expect(resultBody.error).toBe('Bad Request');
        expect(resultBody.message).toHaveLength(1);
        expect((resultBody.message as string[])[0]).toBe(
          'email must be an email',
        );
      });

      it('should return 400 if email is invalid', async () => {
        seeds.payload.email = 'asdasdadadsd';

        const result: request.Response = await request(server.getHttpServer())
          .post(BASE_ENDPOINT_URL + '/login')
          .send(seeds.payload);

        const resultBody = result.body as ErrorResponse;

        expect(result.statusCode).toBe(400);
        expect(resultBody.error).toBe('Bad Request');
        expect(resultBody.message).toHaveLength(1);
        expect((resultBody.message as string[])[0]).toBe(
          'email must be an email',
        );
      });

      it('should return 400 if no password provided', async () => {
        delete seeds.payload.password;

        const result: request.Response = await request(server.getHttpServer())
          .post(BASE_ENDPOINT_URL + '/login')
          .send(seeds.payload);

        const resultBody = result.body as ErrorResponse;

        expect(result.statusCode).toBe(400);
        expect(resultBody.error).toBe('Bad Request');
        expect(resultBody.message).toHaveLength(1);
        expect((resultBody.message as string[])[0]).toBe(
          'password should not be empty',
        );
      });
    });

    it('should call authService.login()', async () => {
      const result: request.Response = await request(server.getHttpServer())
        .post(BASE_ENDPOINT_URL + '/login')
        .send(seeds.payload);

      const resultBody = result.body as SuccessResponse<string>;

      expect(result.statusCode).toBe(200);

      expect(resultBody).toStrictEqual({
        statusCode: HttpStatus.OK,
        message: `Login successful`,
        data: 'thisisajwt',
      });

      expect(spies.login).toHaveBeenCalledWith(
        seeds.payload.email,
        seeds.payload.password,
      );
    });
  });
});
