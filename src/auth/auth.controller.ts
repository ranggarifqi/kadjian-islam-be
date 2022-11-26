import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { IUser } from 'src/common/repos/user';
import { SuccessResponse } from 'src/common/response';

import { ChangeOrgDTO, LoginDTO, RegisterUserDTO } from './auth.dto';
import { BaseAuthService } from './auth.interface';
import { JwtAuthGuard } from './strategies/jwt.guard';
import { IUserCredential } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private authService: BaseAuthService) {}

  @Post('register')
  async register(
    @Body() body: RegisterUserDTO,
  ): Promise<SuccessResponse<IUser>> {
    const newUser = await this.authService.registerUser({ ...body });
    return {
      statusCode: HttpStatus.CREATED,
      message: `User registered successfully. Please check your email for verification link`,
      data: newUser,
    };
  }

  @Get('verify')
  @Redirect()
  async verify(
    @Query('token') token: string,
  ): Promise<{ url: string; statusCode: number }> {
    if (!process.env.VERIFY_USER_SUCCESS_URL) {
      throw new HttpException(
        'No env variable VERIFY_USER_SUCCESS_URL found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (!process.env.VERIFY_USER_FAILED_URL) {
      throw new HttpException(
        'No env variable VERIFY_USER_FAILED_URL found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const result = await this.authService.verifyUser(token);

    if (!result) {
      return {
        url: process.env.VERIFY_USER_FAILED_URL,
        statusCode: 302,
      };
    }

    return {
      url: process.env.VERIFY_USER_SUCCESS_URL,
      statusCode: 302,
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() payload: LoginDTO): Promise<SuccessResponse<string>> {
    const jwt = await this.authService.login(payload.email, payload.password);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: jwt,
    };
  }

  @Patch('change-org')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async changeorg(
    @Body() payload: ChangeOrgDTO,
    @Req() request: Request,
  ): Promise<SuccessResponse<string>> {
    const credential = request.user as IUserCredential;

    const newJwt = await this.authService.changeOrg(
      credential.userId,
      payload.organisationId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Change organisation successful',
      data: newJwt,
    };
  }
}
