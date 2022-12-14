import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Dict } from 'src/common/types';
import { HasherService, MockHasher } from 'src/common/hasher';

import { BaseUUIDService, UUIDService } from 'src/common/uuid';
import { EmailService, MockEmailService } from 'src/common/email';
import {
  BaseCredentialRepository,
  EAccessLevel,
  ICredential,
  MockCredentialRepository,
} from 'src/common/repos/credential';
import { EGender } from 'src/common/repos/user';

import { AuthService } from './auth.service';
import { MockJWTService } from './mock.service';
import {
  CredentialFactory,
  OrganisationFactory,
  OrgUserFactory,
} from 'src/common/testUtil/factories';
import {
  EOrgUserRole,
  IOrgUser,
  IOrgUserRepository,
} from 'src/common/repos/orgUser/orgUser.interface';
import { MockOrgUserRepository } from 'src/common/repos/orgUser/mock.repository';
import { getTestingApp } from 'src/common/testUtil/getTestingApp';

describe('AuthService', () => {
  let credentialRepository: BaseCredentialRepository;
  let orgUserRepository: IOrgUserRepository;

  let service: AuthService;
  let emailService: EmailService;
  let hasherService: HasherService;
  let uuidService: BaseUUIDService;
  let jwtService: JwtService;

  const stubs: Dict<jest.SpyInstance> = {};
  const seeds: Dict<any> = {};

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2022, 10, 30));

    const { module } = await getTestingApp({
      providers: [
        {
          provide: BaseCredentialRepository,
          useClass: MockCredentialRepository,
        },
        {
          provide: IOrgUserRepository,
          useClass: MockOrgUserRepository,
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
    });

    credentialRepository = module.get(BaseCredentialRepository);
    orgUserRepository = module.get(IOrgUserRepository);

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
        gender: EGender.IKHWAN,
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
        gender: EGender.IKHWAN,
        provinceId: '11',
        districtId: '1101',
      });

      expect(stubs.createCredential).toHaveBeenCalledWith({
        id: 'someuuid',
        email: 'fulan@alan.com',
        password: 'hashedPassword',
        verifyToken: 'theToken',
        accessLevel: EAccessLevel.USER,
        user: {
          id: 'someuuid',
          firstName: 'Fulan',
          lastName: 'Alan',
          gender: EGender.IKHWAN,
          provinceId: '11',
          districtId: '1101',
        },
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
        gender: EGender.IKHWAN,
      });

      expect(stubs.sendHtmlEmail).toHaveBeenCalledWith({
        to: 'fulan@alan.com',
        subject: 'User Verification',
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
      stubs.findOrgUserByUserId = jest.spyOn(orgUserRepository, 'findByUserId');

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
      stubs.findOrgUserByUserId.mockResolvedValue([]);

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
        accessLevel: EAccessLevel.USER,
        organisationId: undefined,
        orgUserRole: undefined,
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
      stubs.findOrgUserByUserId.mockResolvedValue([]);

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
        accessLevel: EAccessLevel.USER,
        organisationId: undefined,
        orgUserRole: undefined,
      });
    });

    it("should login with additional selected org's info", async () => {
      const dummyCred = CredentialFactory.getDummyData({
        email: seeds.email,
        password: 'somehashedpassword',
        verifiedAt: null,
      });
      stubs.findCredential.mockResolvedValue(dummyCred);
      stubs.comparePassword.mockResolvedValue(true);
      stubs.findOrgUserByUserId.mockResolvedValue([
        OrgUserFactory.getDummyData({
          organisationId: 'someorgid',
          isSelected: true,
          userId: dummyCred.id,
          orgUserRole: EOrgUserRole.ADMIN,
        }),
        OrgUserFactory.getDummyData({
          organisationId: 'someotherorgid',
          isSelected: false,
          userId: dummyCred.id,
          orgUserRole: EOrgUserRole.MEMBER,
        }),
      ] as IOrgUser[]);

      let result: string | null = null;
      let error: HttpException | undefined;

      try {
        result = await service.login(seeds.email, seeds.password);
      } catch (e) {
        error = e;
      }

      expect(error).toBeUndefined();

      expect(typeof result).toBe('string');

      expect(stubs.constructJWT).toHaveBeenCalledWith({
        userId: dummyCred.id,
        email: dummyCred.email,
        isVerified: false,
        accessLevel: EAccessLevel.USER,
        organisationId: 'someorgid',
        orgUserRole: EOrgUserRole.ADMIN,
      });
    });

    it('should choose the first returned org if none of them are selected', async () => {
      const dummyCred = CredentialFactory.getDummyData({
        email: seeds.email,
        password: 'somehashedpassword',
        verifiedAt: null,
      });
      stubs.findCredential.mockResolvedValue(dummyCred);
      stubs.comparePassword.mockResolvedValue(true);
      stubs.findOrgUserByUserId.mockResolvedValue([
        OrgUserFactory.getDummyData({
          organisationId: 'someotherorgid',
          isSelected: false,
          userId: dummyCred.id,
          orgUserRole: EOrgUserRole.MEMBER,
        }),
        OrgUserFactory.getDummyData({
          organisationId: 'someorgid',
          isSelected: false,
          userId: dummyCred.id,
          orgUserRole: EOrgUserRole.ADMIN,
        }),
      ] as IOrgUser[]);

      let result: string | null = null;
      let error: HttpException | undefined;

      try {
        result = await service.login(seeds.email, seeds.password);
      } catch (e) {
        error = e;
      }

      expect(error).toBeUndefined();

      expect(typeof result).toBe('string');

      expect(stubs.constructJWT).toHaveBeenCalledWith({
        userId: dummyCred.id,
        email: dummyCred.email,
        isVerified: false,
        accessLevel: EAccessLevel.USER,
        organisationId: 'someotherorgid',
        orgUserRole: EOrgUserRole.MEMBER,
      });
    });
  });

  describe('changeOrg()', () => {
    beforeEach(() => {
      seeds.credential = CredentialFactory.getDummyData();
      seeds.organisation = OrganisationFactory.getDummyData();
      seeds.orgUser = OrgUserFactory.getDummyData({
        userId: seeds.credential.id,
        organisationId: seeds.organisation.id,
      });

      stubs.findOneCred = jest
        .spyOn(credentialRepository, 'findOne')
        .mockResolvedValue(seeds.credential);

      stubs.findOrgUserByMainKey = jest
        .spyOn(orgUserRepository, 'findByMainKey')
        .mockResolvedValue(seeds.orgUser);

      stubs.selectOrgByMainKey = jest
        .spyOn(orgUserRepository, 'selectOrgByMainKey')
        .mockResolvedValue([seeds.orgUser]);

      stubs.constructJWT = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('newjwt');
    });

    it('should throw 404 if credential not found', async () => {
      stubs.findOneCred.mockResolvedValue(null);

      let error: Error | undefined;

      try {
        await service.changeOrg(seeds.credential.id, seeds.organisation.id);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error!.message).toBe('Invalid user id');
    });

    it('should throw 403 if orgUser not found', async () => {
      stubs.findOrgUserByMainKey.mockResolvedValue(null);

      let error: Error | undefined;

      try {
        await service.changeOrg(seeds.credential.id, seeds.organisation.id);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error!.message).toBe("You don't belong to that org");
    });

    it('should return 500 if no selected org found after update', async () => {
      /** Means that there's a bug */

      const buggedOrgUser = {
        ...seeds.orgUser,
        isSelected: false,
      };
      stubs.selectOrgByMainKey.mockResolvedValue([buggedOrgUser]);

      let error: Error | undefined;

      try {
        await service.changeOrg(seeds.credential.id, seeds.organisation.id);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error!.message).toBe('Bug: No new selected org was found');
    });

    it('should select the org successfully', async () => {
      let error: Error | undefined;
      let result: string | undefined;

      try {
        result = await service.changeOrg(
          seeds.credential.id,
          seeds.organisation.id,
        );
      } catch (e) {
        error = e;
      }

      expect(error).toBeUndefined();

      expect(stubs.constructJWT).toBeCalledWith({
        userId: seeds.credential.id,
        email: seeds.credential.email,
        isVerified: !!seeds.credential.verifiedAt,
        accessLevel: seeds.credential.accessLevel,
        organisationId: seeds.organisation.id,
        orgUserRole: seeds.orgUser.orgUserRole,
      });

      expect(result).toBe('newjwt');
    });
  });
});
