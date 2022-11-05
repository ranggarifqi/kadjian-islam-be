import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaUserRepository } from './prisma.repository';
import { BaseUserRepository } from './userRepo.interface';

const userRepoProvider: Provider = {
  provide: BaseUserRepository,
  useClass: PrismaUserRepository,
};

@Module({
  imports: [PrismaModule],
  providers: [userRepoProvider],
  exports: [userRepoProvider],
})
export class UserRepository {}
