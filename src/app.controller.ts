import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/strategies/jwt.guard';
import { IUserCredential } from './auth/strategies/jwt.strategy';
import { ReqUser } from './common/decorators/reqUser';

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
}
