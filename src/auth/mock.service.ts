import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { EGender } from 'src/common/repos/user';
import { BaseAuthService, IRegisterUser } from './auth.interface';

@Injectable()
export class MockAuthService extends BaseAuthService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyUser(_token: string): Promise<boolean> {
    return Promise.resolve(true);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(_email: string, _password: string): Promise<string> {
    return Promise.resolve('thisisajwt');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerUser(_payload: IRegisterUser): Promise<User> {
    return Promise.resolve({
      id: 'someuuid',
      credentialId: 'somecredentialuuid',
      provinceId: null,
      districtId: null,
      firstName: 'Fulan',
      lastName: 'Alan',
      gender: EGender.IKHWAN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export class MockJWTService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signAsync(payload: string | object | Buffer): Promise<string> {
    return Promise.resolve('thisisajwt');
  }
}
