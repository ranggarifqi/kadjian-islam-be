export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  credentialId: string;
}

export interface ICreateUser {
  id?: string;
  firstName: string;
  lastName: string;
  credentialId: string;
}

export abstract class BaseUserRepository {
  abstract create(payload: ICreateUser): Promise<IUser>;
}
