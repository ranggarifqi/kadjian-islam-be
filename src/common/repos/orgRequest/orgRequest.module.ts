import { Module } from '@nestjs/common';

import { BaseOrgRequestRepo } from './createOrgRequestRepo.interface';
import { OrgRequestPrismaRepository } from './prisma.repository';

@Module({
  providers: [
    {
      provide: BaseOrgRequestRepo,
      useClass: OrgRequestPrismaRepository,
    },
  ],
  exports: [BaseOrgRequestRepo],
})
export class OrgRequestModule {}
