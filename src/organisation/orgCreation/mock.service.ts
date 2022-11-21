import { Injectable } from '@nestjs/common';
import { IOrgRequest } from 'src/common/repos/orgRequest';
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
}
