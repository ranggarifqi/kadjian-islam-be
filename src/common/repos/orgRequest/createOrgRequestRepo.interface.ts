import { IDistrict } from '../district/district.interface';
import { IProvince } from '../province/province.interface';
import { IUser } from '../user';

export enum EOrgRequestStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export interface IOrgRequest {
  id: string;
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
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  status: string;
  handledAt?: Date | null;
  handledBy?: string | null;
  rejectionReason?: string | null;

  Creator?: Partial<IUser>;
  Province?: Partial<IProvince>;
  District?: Partial<IDistrict>;
}

export interface IOrgRequestCreation {
  name: string;
  description: string;
  address: string;
  email?: string | null;
  mobileNumber: string;
  countryCode: string;
  provinceId: string;
  districtId: string;
  size: number;
}

export interface IOrgRequestUpdate {
  name?: string;
  description?: string;
  address?: string;
  email?: string | null;
  mobileNumber?: string;
  countryCode?: string;
  size?: number;
  logo?: string;
  provinceId?: string;
  districtId?: string;
  status?: EOrgRequestStatus;
  handledAt?: Date;
  handledBy?: string;
  rejectionReason?: string;
}

export abstract class BaseOrgRequestRepo<TransactionType = any> {
  abstract findAll(): Promise<Array<IOrgRequest>>;

  abstract findAllByUserId(userId: string): Promise<Array<IOrgRequest>>;

  abstract findAllByStatus(
    status: EOrgRequestStatus,
  ): Promise<Array<IOrgRequest>>;

  abstract findById(id: string): Promise<IOrgRequest | null>;

  abstract create(
    payload: IOrgRequestCreation,
    creatorId: string,
  ): Promise<IOrgRequest>;

  abstract updateById(
    id: string,
    payload: IOrgRequestUpdate,
    options?: {
      transaction?: TransactionType;
    },
  ): Promise<IOrgRequest>;
}
