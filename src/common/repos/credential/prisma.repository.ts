import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseCredentialRepository,
  ICreateCredential,
  ICredential,
} from './credentialRepo.interface';

@Injectable()
export class PrismaCredentialRepository extends BaseCredentialRepository {
  constructor(private prisma: PrismaService) {
    super();
  }
  async findOne(
    where: Partial<ICredential>,
  ): Promise<ICreateCredential | null> {
    return this.prisma.credential.findFirst({
      where,
    });
  }

  create(payload: ICreateCredential): Promise<ICredential> {
    return this.prisma.credential.create({
      data: payload,
    });
  }

  async updateAll(
    where: Partial<ICreateCredential>,
    payload: Partial<ICreateCredential>,
  ): Promise<void> {
    await this.prisma.credential.updateMany({
      where,
      data: payload,
    });
    return;
  }
}
