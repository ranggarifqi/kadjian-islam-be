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
    throw new Error('Method not implemented.');
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: Partial<IOrgRequestCreation>,
  ): Promise<IOrgRequest> {
    throw new Error('Method not implemented.');
  }
}
