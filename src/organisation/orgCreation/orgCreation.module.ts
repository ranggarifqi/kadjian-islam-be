import { Module } from '@nestjs/common';
import { Repository } from 'src/common/repos/repo.module';
import { BaseOrgCreationService } from './orgCreation.interface';
import { OrgCreationService } from './orgCreation.service';

@Module({
  imports: [Repository],
  providers: [
    { provide: BaseOrgCreationService, useClass: OrgCreationService },
  ],
})
export class OrgCreationModule {}
