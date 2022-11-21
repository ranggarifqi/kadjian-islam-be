import { Injectable } from '@nestjs/common';
import {
  IOrgRequestCreation,
  IOrgRequest,
  BaseOrgRequestRepo,
} from 'src/common/repos/orgRequest';
import { BaseOrgCreationService } from './orgCreation.interface';

@Injectable()
export class OrgCreationService extends BaseOrgCreationService {
  constructor(private orgRequestRepo: BaseOrgRequestRepo) {
    super();
  }
  createOrgRequest(
    payload: IOrgRequestCreation,
    creatorId: string,
  ): Promise<IOrgRequest> {
    return this.orgRequestRepo.create(payload, creatorId);
  }
}
