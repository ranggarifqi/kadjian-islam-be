export interface ICredential {
  id: string;
  email: string;
  password: string;
  verifyToken: string | null;
  verifiedAt: Date | null;
}

export interface ICreateCredential {
  id?: string;
  email: string;
  password: string;
  verifyToken: string | null;
  verifiedAt?: Date | null;
}

export abstract class BaseCredentialRepository {
  abstract findOne(
    where: Partial<ICredential>,
  ): Promise<ICreateCredential | null>;

  abstract create(payload: ICreateCredential): Promise<ICredential>;

  abstract updateAll(
    where: Partial<ICreateCredential>,
    payload: Partial<ICreateCredential>,
  ): Promise<void>;
}
