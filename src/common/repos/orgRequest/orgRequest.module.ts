import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { BaseOrgRequestRepo } from './createOrgRequestRepo.interface';
import { OrgRequestPrismaRepository } from './prisma.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: BaseOrgRequestRepo,
      useClass: OrgRequestPrismaRepository,
    },
  ],
  exports: [BaseOrgRequestRepo],
})
export class OrgRequestRepository {}
