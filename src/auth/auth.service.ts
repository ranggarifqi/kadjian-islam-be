import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EmailService } from 'src/common/email';
import { HasherService } from 'src/common/hasher';
import { BaseCredentialRepository } from 'src/common/repos/credential';
import { BaseUserRepository, IUser } from 'src/common/repos/user';
import { BaseUUIDService } from 'src/common/uuid';

import { BaseAuthService, IRegisterUser } from './auth.interface';
import { IUserCredential } from './strategies/jwt.strategy';

const LOGIN_FAILED = 'Invalid Email or Password';

@Injectable()
export class AuthService extends BaseAuthService {
  constructor(
    private credentialRepo: BaseCredentialRepository,
    private userRepo: BaseUserRepository,

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
    const { email, rawPassword, firstName, lastName } = payload;

    const uuid = this.uuid.generateV4();
    const hashedPassword = await this.hasher.hash(rawPassword);
    const verificationToken = await this.hasher.hash(email);

    const credential = await this.credentialRepo.create({
      id: uuid,
      email,
      password: hashedPassword,
      verifyToken: verificationToken,
    });

    const user = await this.userRepo.create({
      id: uuid,
      firstName,
      lastName,
      credentialId: credential.id,
    });

    /** Send Email. Intentionaly not await */
    this.emailer.sendHtmlEmail({
      to: email,
      subject: "Rangga's Money Manager - User Verification",
      body: this.getVerificationEmailBody({
        firstName,
        lastName,
        verificationToken,
      }),
    });

    return user;
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

    const jwt = await this.jwt.signAsync({
      userId: credential.id,
      email: credential.email,
      isVerified: !!credential.verifiedAt,
    } as IUserCredential);

    return jwt;
  }
}
