import { BaseUserRepository, ICreateUser, IUser } from './userRepo.interface';

export class MockUserRepository extends BaseUserRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(payload: ICreateUser): Promise<IUser> {
    return Promise.resolve({
      id: 'someuuid',
      credentialId: payload.credentialId,
      provinceId: payload.provinceId ?? null,
      districtId: payload.districtId ?? null,
      firstName: payload.firstName,
      lastName: payload.lastName,
      gender: payload.gender,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
