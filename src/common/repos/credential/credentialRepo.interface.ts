import { ICreateUser, IUser } from '../user';

export enum EAccessLevel {
  USER = 'User',
  ADMIN = 'Admin',
  MODERATOR = 'Moderator',
}

export interface ICredential {
  id: string;
  email: string;
  password: string;
  verifyToken: string | null;
  verifiedAt: Date | null;
  accessLevel: string;
  User?: IUser | null;
}

export interface ICreateCredential {
  id?: string;
  email: string;
  password: string;
  verifyToken: string | null;
  verifiedAt?: Date | null;
  accessLevel: EAccessLevel;
  user: Omit<ICreateUser, 'credentialId'>;
}

export type IUpdateCredential = Partial<Omit<ICreateCredential, 'user'>>;

export abstract class BaseCredentialRepository {
  abstract findOne(where: Partial<ICredential>): Promise<ICredential | null>;

  abstract create(payload: ICreateCredential): Promise<ICredential>;

  abstract updateAll(
    where: Partial<ICreateCredential>,
    payload: Partial<ICreateCredential>,
  ): Promise<void>;
}
