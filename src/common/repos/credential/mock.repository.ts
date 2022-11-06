import { Injectable } from '@nestjs/common';
import {
  BaseCredentialRepository,
  ICreateCredential,
  ICredential,
} from './credentialRepo.interface';

@Injectable()
export class MockCredentialRepository extends BaseCredentialRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findOne(where: Partial<ICredential>): Promise<ICredential | null> {
    return Promise.resolve(null);
  }

  create(payload: ICreateCredential): Promise<ICredential> {
    return Promise.resolve({
      id: payload.id ?? 'someuuid',
      email: payload.email,
      password: payload.password,
      verifiedAt: null,
      verifyToken: payload.verifyToken,
    });
  }

  updateAll(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    where: Partial<ICreateCredential>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: Partial<ICreateCredential>,
  ): Promise<void> {
    return Promise.resolve();
  }
}
