import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseOrgRequestRepo,
  IOrgRequest,
  IOrgRequestCreation,
} from './createOrgRequestRepo.interface';

@Injectable()
export class OrgRequestPrismaRepository extends BaseOrgRequestRepo {
  constructor(private prismaService: PrismaService) {
    super();
  }

  async createOrgRequest(
    payload: IOrgRequestCreation,
    creatorId: string,
  ): Promise<IOrgRequest> {
    const newOrgRequest =
      await this.prismaService.createOrganisationRequest.create({
        data: {
          ...payload,
          createdBy: creatorId,
        },
      });
    return newOrgRequest;
  }
}
