import { Module } from '@nestjs/common';
import { PhoneModule } from 'src/common/phone';
import { Repository } from 'src/common/repos/repo.module';
import { BaseOrgCreationService } from './orgCreation.interface';
import { OrgCreationService } from './orgCreation.service';

@Module({
  imports: [Repository, PhoneModule],
  providers: [
    { provide: BaseOrgCreationService, useClass: OrgCreationService },
  ],
  exports: [Repository, BaseOrgCreationService],
})
export class OrgCreationModule {}
