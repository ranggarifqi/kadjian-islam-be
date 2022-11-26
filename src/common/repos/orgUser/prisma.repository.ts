import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IOrgUser, IOrgUserRepository } from './orgUser.interface';

@Injectable()
export class PrismaOrgUserRepository extends IOrgUserRepository {
  constructor(private prismaService: PrismaService) {
    super();
  }

  findByUserId(userId: string): Promise<IOrgUser[]> {
    return this.prismaService.orgUser.findMany({
      where: {
        userId,
      },
    });
  }

  findByMainKey(
    userId: string,
    organisationId: string,
  ): Promise<IOrgUser | null> {
    return this.prismaService.orgUser.findFirst({
      where: {
        userId,
        organisationId,
      },
    });
  }

  async selectOrgByMainKey(
    userId: string,
    organisationId: string,
  ): Promise<IOrgUser[]> {
    await this.prismaService.$transaction(async (transaction) => {
      /** Unselect all */
      await transaction.orgUser.updateMany({
        data: { isSelected: false },
        where: {
          userId,
        },
      });

      await transaction.orgUser.updateMany({
        data: { isSelected: true },
        where: {
          userId,
          organisationId,
        },
      });
    });

    return this.prismaService.orgUser.findMany({
      where: { userId },
    });
  }
}
