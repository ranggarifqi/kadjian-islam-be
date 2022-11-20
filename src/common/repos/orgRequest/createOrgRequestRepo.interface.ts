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

export abstract class BaseOrgRequestRepo {
  abstract createOrgRequest(
    payload: IOrgRequestCreation,
    creatorId: string,
  ): Promise<IOrgRequest>;
}
