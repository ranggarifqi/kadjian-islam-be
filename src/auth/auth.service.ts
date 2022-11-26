import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EmailService } from 'src/common/email';
import { HasherService } from 'src/common/hasher';
import {
  BaseCredentialRepository,
  EAccessLevel,
} from 'src/common/repos/credential';
import { IOrgUserRepository } from 'src/common/repos/orgUser/orgUser.interface';
import { IUser } from 'src/common/repos/user';
import { BaseUUIDService } from 'src/common/uuid';

import { BaseAuthService, IRegisterUser } from './auth.interface';
import { IUserCredential } from './strategies/jwt.strategy';

const LOGIN_FAILED = 'Invalid Email or Password';

@Injectable()
export class AuthService extends BaseAuthService {
  constructor(
    private credentialRepo: BaseCredentialRepository,
    private orgUserRepo: IOrgUserRepository,

    private emailer: EmailService,
    private hasher: HasherService,
    private uuid: BaseUUIDService,
    private jwt: JwtService,
  ) {
    super();
  }

  private getVerificationEmailBody = ({
    firstName,
    lastName,
    verificationToken,
  }: {
    firstName: string;
    lastName: string;
    verificationToken: string;
  }) => {
    return `<p>Hi ${firstName} ${lastName}, click on this <a href='${process.env.BASE_URL}/auth/verify?token=${verificationToken}'>link</a> to verify your account</p>`;
  };

  async registerUser(payload: IRegisterUser): Promise<IUser> {
    const {
      email,
      rawPassword,
      firstName,
      lastName,
      gender,
      provinceId,
      districtId,
    } = payload;

    const uuid = this.uuid.generateV4();
    const hashedPassword = await this.hasher.hash(rawPassword);
    const verificationToken = await this.hasher.hash(email);

    const credential = await this.credentialRepo.create({
      id: uuid,
      email,
      password: hashedPassword,
      verifyToken: verificationToken,
      accessLevel: EAccessLevel.USER,
      user: {
        id: uuid,
        firstName,
        lastName,
        gender,
        provinceId,
        districtId,
      },
    });

    /** Send Email. Intentionaly not await */
    this.emailer.sendHtmlEmail({
      to: email,
      subject: 'User Verification',
      body: this.getVerificationEmailBody({
        firstName,
        lastName,
        verificationToken,
      }),
    });

    // We're sure that User must not empty
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return credential.User!;
  }

  async verifyUser(token: string): Promise<boolean> {
    const credential = await this.credentialRepo.findOne({
      verifyToken: token,
    });

    if (!credential) {
      return false;
    }

    await this.credentialRepo.updateAll(
      { verifyToken: token },
      { verifyToken: null, verifiedAt: new Date() },
    );

    return true;
  }

  async login(email: string, password: string): Promise<string> {
    const credential = await this.credentialRepo.findOne({ email });

    if (!credential) {
      throw new HttpException(LOGIN_FAILED, HttpStatus.UNAUTHORIZED);
    }

    const isPasswordMatch = await this.hasher.compare(
      password,
      credential.password,
    );
    if (!isPasswordMatch) {
      throw new HttpException(LOGIN_FAILED, HttpStatus.UNAUTHORIZED);
    }

    let selectedOrgId: string | undefined;
    let orgUserRole: string | undefined;

    const orgUsers = await this.orgUserRepo.findByUserId(credential.id);
    if (orgUsers.length > 0) {
      const selectedOrgUser = orgUsers.find((v) => v.isSelected);

      // eslint-disable-next-line prefer-const
      selectedOrgId =
        selectedOrgUser?.organisationId ?? orgUsers[0].organisationId;
      // eslint-disable-next-line prefer-const
      orgUserRole = selectedOrgUser?.orgUserRole ?? orgUsers[0].orgUserRole;
    }

    const jwt = await this.jwt.signAsync({
      userId: credential.id,
      email: credential.email,
      isVerified: !!credential.verifiedAt,
      accessLevel: credential.accessLevel,
      organisationId: selectedOrgId,
      orgUserRole: orgUserRole,
    } as IUserCredential);

    return jwt;
  }

  async changeOrg(userId: string, newSelectedOrgId: string): Promise<string> {
    /** Get the credential */
    const credential = await this.credentialRepo.findOne({ id: userId });
    if (!credential) {
      throw new HttpException('Invalid user id', HttpStatus.NOT_FOUND);
    }

    const orgUser = await this.orgUserRepo.findByMainKey(
      userId,
      newSelectedOrgId,
    );

    if (!orgUser) {
      throw new HttpException(
        "You don't belong to that org",
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedOrgUsers = await this.orgUserRepo.selectOrgByMainKey(
      userId,
      newSelectedOrgId,
    );

    const newSelectedOrg = updatedOrgUsers.find((v) => v.isSelected);

    if (!newSelectedOrg) {
      throw new HttpException(
        'Bug: No new selected org was found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const selectedOrgId = newSelectedOrg.organisationId;
    const orgUserRole = newSelectedOrg.orgUserRole;

    /** Construct new JWT Token */
    const jwt = await this.jwt.signAsync({
      userId: credential.id,
      email: credential.email,
      isVerified: !!credential.verifiedAt,
      accessLevel: credential.accessLevel,
      organisationId: selectedOrgId,
      orgUserRole: orgUserRole,
    } as IUserCredential);

    return jwt;
  }
}
