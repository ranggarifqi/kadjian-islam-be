import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IOrgUserRepository } from './orgUser.interface';
import { PrismaOrgUserRepository } from './prisma.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: IOrgUserRepository,
      useClass: PrismaOrgUserRepository,
    },
  ],
})
export class OrgUserRepository {}
