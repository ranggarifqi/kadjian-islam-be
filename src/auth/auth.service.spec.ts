import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { Dict } from 'src/common/types';
import { HasherService, MockHasher } from 'src/common/hasher';

import { BaseUUIDService, UUIDService } from 'src/common/uuid';
import { EmailService, MockEmailService } from 'src/common/email';
import {
  BaseCredentialRepository,
  ICredential,
  MockCredentialRepository,
} from 'src/common/repos/credential';
import { BaseUserRepository, MockUserRepository } from 'src/common/repos/user';

import { AuthService } from './auth.service';
import { MockJWTService } from './mock.service';
import { CredentialFactory } from 'src/common/testUtil/factories';

describe('AuthService', () => {
  let credentialRepository: BaseCredentialRepository;
  let userRepository: BaseUserRepository;

  let service: AuthService;
  let emailService: EmailService;
  let hasherService: HasherService;
  let uuidService: BaseUUIDService;
  let jwtService: JwtService;

  const stubs: Dict<jest.SpyInstance> = {};
  const seeds: Dict<any> = {};

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2022, 10, 30));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BaseCredentialRepository,
          useClass: MockCredentialRepository,
        },
        {
          provide: BaseUserRepository,
          useClass: MockUserRepository,
        },

        AuthService,
        {
          provide: HasherService,
          useClass: MockHasher,
        },
        {
          provide: BaseUUIDService,
          useClass: UUIDService,
        },
        {
          provide: EmailService,
          useClass: MockEmailService,
        },
        {
          provide: JwtService,
          useClass: MockJWTService,
        },
      ],
    }).compile();

    credentialRepository = module.get(BaseCredentialRepository);
    userRepository = module.get(BaseUserRepository);

    service = module.get<AuthService>(AuthService);
    emailService = module.get<EmailService>(EmailService);
    hasherService = module.get<HasherService>(HasherService);
    uuidService = module.get<BaseUUIDService>(BaseUUIDService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerUser()', () => {
    beforeEach(() => {
      stubs.hasher = jest.spyOn(hasherService, 'hash');
      stubs.uuid = jest
        .spyOn(uuidService, 'generateV4')
        .mockReturnValue('someuuid');

      stubs.createCredential = jest.spyOn(credentialRepository, 'create');
      stubs.createUser = jest.spyOn(userRepository, 'create');

      stubs.sendHtmlEmail = jest
        .spyOn(emailService, 'sendHtmlEmail')
        .mockResolvedValue();
    });

    it('should hash the password', async () => {
      await service.registerUser({
        email: 'fulan@alan.com',
        firstName: 'Fulan',
        lastName: 'Alan',
        rawPassword: 'fulanalan',
      });

      expect(stubs.hasher).toHaveBeenCalledWith('fulanalan');
    });

    it('should create the user with verification token', async () => {
      stubs.hasher
        .mockResolvedValueOnce('hashedPassword')
        .mockResolvedValueOnce('theToken');

      await service.registerUser({
        email: 'fulan@alan.com',
        firstName: 'Fulan',
        lastName: 'Alan',
        rawPassword: 'fulanalan',
      });

      expect(stubs.createCredential).toHaveBeenCalledWith({
        id: 'someuuid',
        email: 'fulan@alan.com',
        password: 'hashedPassword',
        verifyToken: 'theToken',
      });

      expect(stubs.createUser).toHaveBeenCalledWith({
        id: 'someuuid',
        firstName: 'Fulan',
        lastName: 'Alan',
        credentialId: 'someuuid',
      });
    });

    it('should send verification email asynchronously', async () => {
      process.env.BASE_URL = 'http://localhost';
      stubs.hasher
        .mockResolvedValueOnce('hashedPassword')
        .mockResolvedValueOnce('theToken');

      await service.registerUser({
        email: 'fulan@alan.com',
        firstName: 'Fulan',
        lastName: 'Alan',
        rawPassword: 'fulanalan',
      });

      expect(stubs.sendHtmlEmail).toHaveBeenCalledWith({
        to: 'fulan@alan.com',
        subject: "Rangga's Money Manager - User Verification",
        body: `<p>Hi Fulan Alan, click on this <a href='${process.env.BASE_URL}/auth/verify?token=theToken'>link</a> to verify your account</p>`,
      });
    });
  });

  describe('verifyUser()', () => {
    beforeEach(() => {
      stubs.findOneCredential = jest.spyOn(credentialRepository, 'findOne');
      stubs.updateCredential = jest.spyOn(credentialRepository, 'updateAll');
    });

    it('should return false if no credential found, or verifyToken is invalid', async () => {
      stubs.findOneCredential.mockResolvedValue(null);

      const result = await service.verifyUser('othertoken');
      expect(result).toBeFalsy();
      expect(stubs.updateCredential).not.toHaveBeenCalled();
    });
    it('should return true if credential is found', async () => {
      stubs.findOneCredential.mockResolvedValue({
        id: 'someuid',
        email: 'fulan@ranggarifqi.com',
        password: 'someencryptedpassword',
        verifiedAt: null,
        verifyToken: 'someverifytoken',
      } as ICredential);

      const result = await service.verifyUser('someverifytoken');
      expect(result).toBeTruthy();
      expect(stubs.updateCredential).toHaveBeenCalledWith(
        { verifyToken: 'someverifytoken' },
        {
          verifyToken: null,
          verifiedAt: new Date(2022, 10, 30),
        },
      );
    });
  });

  describe('login()', () => {
    beforeEach(() => {
      seeds.email = 'fulan@ranggarifqi.com';
      seeds.password = 'fulan123';

      stubs.findCredential = jest.spyOn(credentialRepository, 'findOne');
      stubs.comparePassword = jest.spyOn(hasherService, 'compare');
      stubs.constructJWT = jest.spyOn(jwtService, 'signAsync');
    });

    it("should throw if email doesn't exist", async () => {
      stubs.findCredential.mockResolvedValue(null);

      let error: HttpException | null = null;

      try {
        await service.login(seeds.email, seeds.password);
      } catch (e) {
        error = e;
      }

      expect(error).not.toBeNull();
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).message).toBe(
        'Invalid Email or Password',
      );
    });

    it('should throw if incorrect password', async () => {
      const dummyCred = CredentialFactory.getDummyData();
      stubs.findCredential.mockResolvedValue(dummyCred);
      stubs.comparePassword.mockResolvedValue(false);

      let error: HttpException | null = null;

      try {
        await service.login(seeds.email, seeds.password);
      } catch (e) {
        error = e;
      }

      expect(error).not.toBeNull();
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).message).toBe(
        'Invalid Email or Password',
      );
    });

    it('should return JWT Token upon succession', async () => {
      const dummyCred = CredentialFactory.getDummyData({
        email: seeds.email,
        password: 'somehashedpassword',
        verifiedAt: new Date(),
        verifyToken: null,
      });
      stubs.findCredential.mockResolvedValue(dummyCred);
      stubs.comparePassword.mockResolvedValue(true);

      let result: string | null = null;
      let error: HttpException | null = null;

      try {
        result = await service.login(seeds.email, seeds.password);
      } catch (e) {
        error = e;
      }

      expect(error).toBeNull();

      expect(typeof result).toBe('string');
      expect(stubs.constructJWT).toHaveBeenCalledWith({
        userId: dummyCred.id,
        email: dummyCred.email,
        isVerified: true,
      });
    });

    it('should allow login even though user is not verified yet', async () => {
      const dummyCred = CredentialFactory.getDummyData({
        email: seeds.email,
        password: 'somehashedpassword',
        verifiedAt: null,
      });
      stubs.findCredential.mockResolvedValue(dummyCred);
      stubs.comparePassword.mockResolvedValue(true);

      let result: string | null = null;
      let error: HttpException | null = null;

      try {
        result = await service.login(seeds.email, seeds.password);
      } catch (e) {
        error = e;
      }

      expect(error).toBeNull();

      expect(typeof result).toBe('string');
      expect(stubs.constructJWT).toHaveBeenCalledWith({
        userId: dummyCred.id,
        email: dummyCred.email,
        isVerified: false,
      });
    });
  });
});
