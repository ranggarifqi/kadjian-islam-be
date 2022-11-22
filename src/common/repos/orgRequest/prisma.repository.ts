import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseOrgRequestRepo,
  EOrgRequestStatus,
  IOrgRequest,
  IOrgRequestCreation,
  IOrgRequestUpdate,
} from './createOrgRequestRepo.interface';

@Injectable()
export class OrgRequestPrismaRepository extends BaseOrgRequestRepo {
  constructor(private prismaService: PrismaService) {
    super();
  }

  async findAll(): Promise<IOrgRequest[]> {
    const result = await this.prismaService.createOrganisationRequest.findMany({
      include: {
        Creator: { select: { firstName: true, lastName: true } },
        Province: { select: { name: true } },
        District: { select: { name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAllByUserId(userId: string): Promise<IOrgRequest[]> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAllByStatus(status: EOrgRequestStatus): Promise<IOrgRequest[]> {
    throw new Error('Method not implemented.');
  }

  findById(id: string): Promise<IOrgRequest | null> {
    return this.prismaService.createOrganisationRequest.findFirst({
      where: { id },
    });
  }

  async create(
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

  updateById(id: string, payload: IOrgRequestUpdate): Promise<IOrgRequest> {
    return this.prismaService.createOrganisationRequest.update({
      where: {
        id,
      },
      data: payload,
    });
  }
}
