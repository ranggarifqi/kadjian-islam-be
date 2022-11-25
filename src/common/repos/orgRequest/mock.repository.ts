import { Injectable } from '@nestjs/common';
import { OrgRequestFactory } from 'src/common/testUtil/factories';
import {
  BaseOrgRequestRepo,
  EOrgRequestStatus,
  IOrgRequest,
  IOrgRequestCreation,
} from './createOrgRequestRepo.interface';

@Injectable()
export class MockOrgRequestRepository extends BaseOrgRequestRepo {
  findAll(): Promise<IOrgRequest[]> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAllByUserId(userId: string): Promise<IOrgRequest[]> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAllByStatus(status: EOrgRequestStatus): Promise<IOrgRequest[]> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findById(id: string): Promise<IOrgRequest | null> {
    const dummyData = OrgRequestFactory.getDummyData({
      id,
    });
    return Promise.resolve(dummyData);
  }
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

  updateById(
    id: string,
    payload: Partial<IOrgRequestCreation>,
  ): Promise<IOrgRequest> {
    const dummyData = OrgRequestFactory.getDummyData({
      id,
      ...payload,
    });

    return Promise.resolve(dummyData);
  }

  approveById(id: string, approverId: string): Promise<IOrgRequest> {
    const dummyData = OrgRequestFactory.getDummyData({
      id,
      handledBy: approverId,
      handledAt: new Date(),
    });

    return Promise.resolve(dummyData);
  }
}
