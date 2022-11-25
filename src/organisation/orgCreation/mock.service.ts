import { Injectable } from '@nestjs/common';
import { EOrgRequestStatus, IOrgRequest } from 'src/common/repos/orgRequest';
import { OrgRequestFactory } from 'src/common/testUtil/factories';
import { RegisterOrgDto } from '../organisation.dto';
import { BaseOrgCreationService } from './orgCreation.interface';

@Injectable()
export class MockOrgCreationService extends BaseOrgCreationService {
  createOrgRequest(
    payload: RegisterOrgDto,
    creatorId: string,
  ): Promise<IOrgRequest> {
    const { mobileNumber, ...rest } = payload;

    let phoneNumber: string | undefined;
    let countryCode: string | undefined;

    if (mobileNumber) {
      phoneNumber = '123456789';
      countryCode = '+62';
    }

    const dummy = OrgRequestFactory.getDummyData({
      ...rest,
      mobileNumber: phoneNumber,
      countryCode,
      createdBy: creatorId,
    });

    return Promise.resolve(dummy);
  }

  rejectOrgRequest(
    id: string,
    rejecterId: string,
    reason?: string | undefined,
  ): Promise<IOrgRequest> {
    const dummy = OrgRequestFactory.getDummyData({
      id,
      handledBy: rejecterId,
      handledAt: new Date(),
      status: EOrgRequestStatus.REJECTED,
      rejectionReason: reason,
    });

    return Promise.resolve(dummy);
  }

  approveOrgRequest(id: string, approverId: string): Promise<IOrgRequest> {
    const dummy = OrgRequestFactory.getDummyData({
      id,
      handledBy: approverId,
      handledAt: new Date(),
      status: EOrgRequestStatus.APPROVED,
    });

    return Promise.resolve(dummy);
  }
}
