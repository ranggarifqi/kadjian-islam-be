import { GenderStr, IUser } from 'src/common/repos/user';

export abstract class BaseAuthService {
  abstract registerUser(payload: IRegisterUser): Promise<IUser>;
  abstract verifyUser(token: string): Promise<boolean>;
  abstract login(email: string, password: string): Promise<string>;
  abstract changeOrg(userId: string, newSelectedOrgId: string): Promise<string>;
}

export interface IRegisterUser {
  email: string;
  rawPassword: string;
  firstName: string;
  lastName: string;
  gender: GenderStr;
  provinceId?: string | null;
  districtId?: string | null;
}
