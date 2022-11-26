import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrganisationRepository } from '../organisation/organisation.module';

import { BaseOrgRequestRepo } from './createOrgRequestRepo.interface';
import { OrgRequestPrismaRepository } from './prisma.repository';

@Module({
  imports: [PrismaModule, OrganisationRepository],
  providers: [
    {
      provide: BaseOrgRequestRepo,
      useClass: OrgRequestPrismaRepository,
    },
  ],
  exports: [BaseOrgRequestRepo],
})
export class OrgRequestRepository {}
