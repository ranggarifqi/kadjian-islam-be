import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessLevels } from './auth/strategies/accessLevel.decorator';
import { AccessLevelGuard } from './auth/strategies/accessLevel.guard';
import { JwtAuthGuard } from './auth/strategies/jwt.guard';
import { IUserCredential } from './auth/strategies/jwt.strategy';
import { ReqUser } from './common/decorators/reqUser';
import { EAccessLevel } from './common/repos/credential';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/guarded')
  @UseGuards(JwtAuthGuard)
  guarded(@ReqUser() user: IUserCredential): string {
    return 'Welcome ' + user.email;
  }

  @Get('/admin-ping')
  @AccessLevels(EAccessLevel.ADMIN)
  @UseGuards(JwtAuthGuard, AccessLevelGuard)
  adminPing(@ReqUser() user: IUserCredential) {
    return 'Welcome ' + user.email;
  }
}
