import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseOrganisationRepository } from '../organisation';
import {
  BaseOrgRequestRepo,
  EOrgRequestStatus,
  IOrgRequest,
  IOrgRequestCreation,
  IOrgRequestUpdate,
} from './createOrgRequestRepo.interface';

@Injectable()
export class OrgRequestPrismaRepository extends BaseOrgRequestRepo<Prisma.TransactionClient> {
  constructor(
    private prismaService: PrismaService,
    private organisationRepo: BaseOrganisationRepository<Prisma.TransactionClient>,
  ) {
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

  updateById(
    id: string,
    payload: IOrgRequestUpdate,
    options?: { transaction?: Prisma.TransactionClient },
  ): Promise<IOrgRequest> {
    const { transaction } = options ?? {};

    const args: Prisma.CreateOrganisationRequestUpdateArgs = {
      where: {
        id,
      },
      data: payload,
    };

    if (transaction) {
      return transaction.createOrganisationRequest.update(args);
    }

    return this.prismaService.createOrganisationRequest.update(args);
  }

  async approveById(id: string, approverId: string): Promise<IOrgRequest> {
    const updated = await this.prismaService.$transaction(
      async (transaction) => {
        const updatedOrgReq = await this.updateById(
          id,
          {
            status: EOrgRequestStatus.APPROVED,
            handledBy: approverId,
            handledAt: new Date(),
          },
          {
            transaction,
          },
        );

        await this.organisationRepo.createWithUser(
          {
            requestId: updatedOrgReq.id,
            name: updatedOrgReq.name,
            description: updatedOrgReq.description,
            address: updatedOrgReq.address,
            countryCode: updatedOrgReq.countryCode,
            mobileNumber: updatedOrgReq.mobileNumber,
            email: updatedOrgReq.email,
            logo: updatedOrgReq.logo,
            size: updatedOrgReq.size,
            provinceId: updatedOrgReq.provinceId,
            districtId: updatedOrgReq.districtId,
            createdBy: updatedOrgReq.createdBy,
            updatedBy: updatedOrgReq.createdBy,
          },
          { transaction },
        );

        return updatedOrgReq;
      },
    );

    return updated!;
  }
}
