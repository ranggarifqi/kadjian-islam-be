import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { OrganisationController } from './organisation.controller';
import { OrgCreationModule } from './orgCreation/orgCreation.module';

@Module({
  imports: [AuthModule, OrgCreationModule],
  controllers: [OrganisationController],
})
export class OrganisationModule {}
