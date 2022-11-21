import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.guard';
import { IUserCredential } from 'src/auth/strategies/jwt.strategy';
import { VerifiedUserGuard } from 'src/auth/strategies/verifiedUser.guard';
import { IOrgRequest } from 'src/common/repos/orgRequest';
import { SuccessResponse } from 'src/common/response';
import { RegisterOrgDto } from './organisation.dto';
import { BaseOrgCreationService } from './orgCreation/orgCreation.interface';

@Controller('organisations')
export class OrganisationController {
  constructor(private orgCreationService: BaseOrgCreationService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  async registerOrganisation(
    @Body() body: RegisterOrgDto,
    @Req() request: Request,
  ): Promise<SuccessResponse<IOrgRequest>> {
    const credential = request.user as IUserCredential;

    const submittedOrg = await this.orgCreationService.createOrgRequest(
      body,
      credential.userId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organsation request submitted successfully',
      data: submittedOrg,
    };
  }
}
