import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseCredentialRepository,
  ICreateCredential,
  ICredential,
  IUpdateCredential,
} from './credentialRepo.interface';

@Injectable()
export class PrismaCredentialRepository extends BaseCredentialRepository {
  constructor(private prisma: PrismaService) {
    super();
  }
  async findOne(where: Partial<ICredential>): Promise<ICredential | null> {
    return this.prisma.credential.findFirst({
      where,
    });
  }

  create(payload: ICreateCredential): Promise<ICredential> {
    const { user, ...credPayload } = payload;
    return this.prisma.credential.create({
      data: {
        ...credPayload,
        User: {
          create: {
            ...user,
          },
        },
      },
      include: {
        User: true,
      },
    });
  }

  async updateAll(
    where: Partial<IUpdateCredential>,
    payload: Partial<IUpdateCredential>,
  ): Promise<void> {
    await this.prisma.credential.updateMany({
      where,
      data: payload,
    });
    return;
  }
}
