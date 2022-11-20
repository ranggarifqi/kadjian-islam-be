import { Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { config } from 'src/common/config';
import { EmailModule } from 'src/common/email';
import { HasherModule } from 'src/common/hasher';
import { CredentialRepository } from 'src/common/repos/credential';
import { UUIDModule } from 'src/common/uuid';

import { AuthController } from './auth.controller';
import { BaseAuthService } from './auth.interface';
import { AuthService } from './auth.service';
import { AccessLevelGuard } from './strategies/accessLevel.guard';
import { JWTStrategy } from './strategies/jwt.strategy';

const accessLevelProvider: Provider = {
  provide: APP_GUARD,
  useClass: AccessLevelGuard,
};

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
    JWTStrategy,
    accessLevelProvider,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
