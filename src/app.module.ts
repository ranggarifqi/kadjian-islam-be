import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CredentialModule } from './credential/credential.module';
import { JWTStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [AuthModule, UserModule, CredentialModule],
  controllers: [AppController],
  providers: [AppService, JWTStrategy],
})
export class AppModule {}
