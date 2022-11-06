import { ICreateUser, IUser } from '../user';

export interface ICredential {
  id: string;
  email: string;
  password: string;
  verifyToken: string | null;
  verifiedAt: Date | null;
  User?: IUser | null;
}

export interface ICreateCredential {
  id?: string;
  email: string;
  password: string;
  verifyToken: string | null;
  verifiedAt?: Date | null;
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
