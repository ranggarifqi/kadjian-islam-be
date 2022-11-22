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
