import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { config } from 'src/common/config';
import { EmailModule } from 'src/common/email';
import { HasherModule } from 'src/common/hasher';
import { CredentialRepository } from 'src/common/repos/credential';
import { UUIDModule } from 'src/common/uuid';

import { AuthController } from './auth.controller';
import { BaseAuthService } from './auth.interface';
import { AuthService } from './auth.service';

@Module({
  imports: [
    CredentialRepository,

    HasherModule,
    UUIDModule,
    EmailModule,
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    {
      provide: BaseAuthService,
      useClass: AuthService,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
