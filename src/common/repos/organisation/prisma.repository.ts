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

    // TODO: Add logic, if user already have some orgs, then isSelected should be false

    const args: Prisma.OrganisationCreateArgs = {
      data: {
        updatedBy: payload.createdBy,
        ...payload,
        OrgUsers: {
          create: [
            {
              userId: payload.createdBy,
              isSelected: true,
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
