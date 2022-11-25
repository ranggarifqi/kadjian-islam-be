import { IDistrict } from '../district/district.interface';
import { IOrgUser } from '../orgUser/orgUser.interface';
import { IProvince } from '../province/province.interface';

export interface IOrganisation {
  id: string;
  name: string;
  description: string;
  address: string;
  email: string | null;
  mobileNumber: string;
  countryCode: string;
  provinceId: string;
  districtId: string;
  size: number;
  logo: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string | null;
  requestId: string | null;

  Province?: Partial<IProvince>;
  District?: Partial<IDistrict>;
  OrgUsers?: IOrgUser[];
}

export interface IOrganisationCreation {
  name: string;
  description: string;
  address: string;
  email?: string | null;
  mobileNumber: string;
  countryCode: string;
  provinceId: string;
  districtId: string;
  size: number;
  logo?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  requestId?: string | null;
}

export abstract class BaseOrganisationRepository<TransactionType = any> {
  abstract createWithUser(
    payload: IOrganisationCreation,
    option?: { transaction?: TransactionType },
  ): Promise<IOrganisation>;
}
