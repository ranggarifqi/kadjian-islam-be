import { BaseUserRepository, ICreateUser, IUser } from './userRepo.interface';

export class MockUserRepository extends BaseUserRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(payload: ICreateUser): Promise<IUser> {
    return Promise.resolve({
      id: 'someuuid',
      firstName: payload.firstName,
      lastName: payload.lastName,
      credentialId: payload.credentialId,
    });
  }
}
