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
  email?: string;
  mobileNumber: string;
  countryCode: string;
  provinceId: string;
  districtId: string;
  size: number;
  logo?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  status: string;
  handledAt?: Date;
  handledBy?: string;
  rejectionReason?: string;
}

export interface IOrgRequestCreation {
  name: string;
  description: string;
  address: string;
  email?: string;
  mobileNumber: string;
  countryCode: string;
  provinceId: string;
  districtId: string;
  size: number;
}

export interface BaseOrgRequestRepo {
  createOrgRequest(
    payload: IOrgRequestCreation,
    creatorId: string,
  ): Promise<IOrgRequest>;
}
