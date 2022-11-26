import { Module } from '@nestjs/common';
import { CredentialRepository } from './credential';
import { OrgRequestRepository } from './orgRequest';
import { OrgUserRepository } from './orgUser/orgUser.module';
import { UserRepository } from './user';

@Module({
  imports: [
    CredentialRepository,
    UserRepository,
    OrgRequestRepository,
    OrgUserRepository,
  ],
  exports: [
    CredentialRepository,
    UserRepository,
    OrgRequestRepository,
    OrgUserRepository,
  ],
})
export class Repository {}
