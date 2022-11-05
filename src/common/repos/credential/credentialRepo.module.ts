import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BaseCredentialRepository } from './credentialRepo.interface';
import { PrismaCredentialRepository } from './prisma.repository';

const credRepoProvider: Provider = {
  provide: BaseCredentialRepository,
  useClass: PrismaCredentialRepository,
};

@Module({
  imports: [PrismaModule],
  providers: [credRepoProvider],
  exports: [credRepoProvider],
})
export class CredentialRepository {}
