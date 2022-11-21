import { Injectable } from '@nestjs/common';
import { OrgRequestFactory } from 'src/common/testUtil/factories';
import {
  BaseOrgRequestRepo,
  IOrgRequest,
  IOrgRequestCreation,
} from './createOrgRequestRepo.interface';

@Injectable()
export class MockOrgRequestRepository extends BaseOrgRequestRepo {
  create(
    payload: IOrgRequestCreation,
    creatorId: string,
  ): Promise<IOrgRequest> {
    const dummy = OrgRequestFactory.getDummyData({
      ...payload,
      createdBy: creatorId,
    });
    return Promise.resolve(dummy);
  }
}
