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
import { BasePhoneService } from 'src/common/phone/phone.interface';
import { IOrgRequest } from 'src/common/repos/orgRequest';
import { SuccessResponse } from 'src/common/response';
import { RegisterOrgDto } from './organisation.dto';
import { BaseOrgCreationService } from './orgCreation/orgCreation.interface';

@Controller('organisations')
export class OrganisationController {
  constructor(
    private orgCreationService: BaseOrgCreationService,
    private phoneService: BasePhoneService,
  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async registerOrganisation(
    @Body() body: RegisterOrgDto,
    @Req() request: Request,
  ): Promise<SuccessResponse<IOrgRequest>> {
    const credential = request.user as IUserCredential;

    const {
      name,
      description,
      address,
      mobileNumber,
      email,
      size,
      provinceId,
      districtId,
    } = body;

    const { countryCode, phoneNumber } =
      this.phoneService.splitCountryCodeAndNumber(mobileNumber);

    const submittedOrg = await this.orgCreationService.createOrgRequest(
      {
        name,
        description,
        address,
        countryCode: countryCode,
        mobileNumber: phoneNumber,
        email,
        size,
        provinceId,
        districtId,
      },
      credential.userId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organsation request submitted successfully',
      data: submittedOrg,
    };
  }
}
