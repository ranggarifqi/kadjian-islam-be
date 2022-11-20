import { v4 as uuidv4 } from 'uuid';

import {
  BaseOrgRequestRepo,
  EOrgRequestStatus,
  IOrgRequest,
  IOrgRequestCreation,
} from './createOrgRequestRepo.interface';

export class OrgRequestMockRepository extends BaseOrgRequestRepo {
  createOrgRequest(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: IOrgRequestCreation,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    creatorId: string,
  ): Promise<IOrgRequest> {
    return Promise.resolve({
      id: uuidv4(),
      name: payload.name,
      description: payload.description,
      address: payload.address,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      countryCode: payload.countryCode,
      provinceId: payload.provinceId,
      districtId: payload.districtId,
      size: payload.size,
      logo: null,
      createdAt: new Date(),
      createdBy: creatorId,
      updatedAt: new Date(),
      status: EOrgRequestStatus.PENDING,
      handledAt: null,
      handledBy: null,
      rejectionReason: null,
    });
  }
}
