import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BaseOrganisationRepository } from './organisation.interface';
import { PrismaOrganisationRepository } from './prisma.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: BaseOrganisationRepository,
      useClass: PrismaOrganisationRepository,
    },
  ],
  exports: [BaseOrganisationRepository],
})
export class OrganisationRepository {}
