import { Injectable } from '@nestjs/common';
import { BasePhoneService } from 'src/common/phone/phone.interface';
import { IOrgRequest, BaseOrgRequestRepo } from 'src/common/repos/orgRequest';
import { RegisterOrgDto } from '../organisation.dto';
import { BaseOrgCreationService } from './orgCreation.interface';

@Injectable()
export class OrgCreationService extends BaseOrgCreationService {
  constructor(
    private orgRequestRepo: BaseOrgRequestRepo,
    private phoneService: BasePhoneService,
  ) {
    super();
  }
  createOrgRequest(
    payload: RegisterOrgDto,
    creatorId: string,
  ): Promise<IOrgRequest> {
    const {
      name,
      description,
      address,
      mobileNumber,
      email,
      size,
      provinceId,
      districtId,
    } = payload;

    const { countryCode, phoneNumber } =
      this.phoneService.splitCountryCodeAndNumber(mobileNumber);

    return this.orgRequestRepo.create(
      {
        name,
        description,
        address,
        email,
        size,
        provinceId,
        districtId,
        countryCode,
        mobileNumber: phoneNumber,
      },
      creatorId,
    );
  }
}
