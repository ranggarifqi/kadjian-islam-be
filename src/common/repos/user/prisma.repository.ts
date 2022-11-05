import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseUserRepository, ICreateUser, IUser } from './userRepo.interface';

@Injectable()
export class PrismaUserRepository extends BaseUserRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  create(payload: ICreateUser): Promise<IUser> {
    return this.prisma.user.create({
      data: {
        id: payload.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        credential: {
          connect: {
            id: payload.credentialId,
          },
        },
      },
      include: {
        credential: true,
      },
    });
  }
}
