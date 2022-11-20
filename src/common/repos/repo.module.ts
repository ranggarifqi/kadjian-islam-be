import { Module } from '@nestjs/common';
import { CredentialRepository } from './credential';
import { OrgRequestRepository } from './orgRequest';
import { UserRepository } from './user';

@Module({
  imports: [CredentialRepository, UserRepository, OrgRequestRepository],
})
export class Repository {}
