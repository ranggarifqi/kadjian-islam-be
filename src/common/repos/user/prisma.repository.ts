import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseUserRepository, ICreateUser, IUser } from './userRepo.interface';

@Injectable()
export class PrismaUserRepository extends BaseUserRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  create(payload: ICreateUser): Promise<IUser> {
    const provinceConnect = payload.provinceId
      ? {
          Province: {
            connect: {
              id: payload.provinceId,
            },
          },
        }
      : {};

    const distrctConnect = payload.districtId
      ? {
          District: {
            connect: {
              id: payload.districtId,
            },
          },
        }
      : {};

    return this.prisma.user.create({
      data: {
        id: payload.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        gender: payload.gender,
        credential: {
          connect: {
            id: payload.credentialId,
          },
        },
        ...provinceConnect,
        ...distrctConnect,
      },
      include: {
        credential: true,
      },
    });
  }
}
