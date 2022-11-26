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
}
