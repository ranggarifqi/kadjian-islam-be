import { Module } from '@nestjs/common';
import { OrgCreationModule } from './orgCreation/orgCreation.module';

@Module({
  imports: [OrgCreationModule],
})
export class OrganisationModule {}
