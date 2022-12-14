import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EOrgUserRole } from '../orgUser/orgUser.interface';
import {
  BaseOrganisationRepository,
  IOrganisation,
  IOrganisationCreation,
} from './organisation.interface';

@Injectable()
export class PrismaOrganisationRepository extends BaseOrganisationRepository<Prisma.TransactionClient> {
  constructor(private prismaService: PrismaService) {
    super();
  }

  async createWithUser(
    payload: IOrganisationCreation,
    option?: { transaction?: Prisma.TransactionClient },
  ): Promise<IOrganisation> {
    const { transaction } = option ?? {};

    const orgUsers = await this.prismaService.orgUser.findFirst({
      where: {
        userId: payload.createdBy,
        isSelected: true,
      },
    });

    const isSelected = orgUsers === null;

    const args: Prisma.OrganisationCreateArgs = {
      data: {
        updatedBy: payload.createdBy,
        ...payload,
        OrgUsers: {
          create: [
            {
              userId: payload.createdBy,
              isSelected,
              orgUserRole: EOrgUserRole.ADMIN,
            },
          ],
        },
      },
      include: {
        OrgUsers: true,
      },
    };

    if (transaction) {
      return transaction.organisation.create(args);
    }

    return this.prismaService.organisation.create(args);
  }
}
