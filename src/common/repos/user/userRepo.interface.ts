export enum EGender {
  IKHWAN = 'IKHWAN',
  AKHWAT = 'AKWHAT',
}

export type GenderStr = keyof typeof EGender;

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  gender: GenderStr | null;
  provinceId: string | null;
  districtId: string | null;
  createdAt: Date;
  updatedAt: Date;
  credentialId: string;
}

export interface ICreateUser {
  id?: string;
  provinceId?: string | null;
  districtId?: string | null;
  firstName: string;
  lastName: string;
  gender: GenderStr | null;
  credentialId: string;
}

export abstract class BaseUserRepository {
  abstract create(payload: ICreateUser): Promise<IUser>;
}
