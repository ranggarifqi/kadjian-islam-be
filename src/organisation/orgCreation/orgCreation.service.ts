import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BasePhoneService } from 'src/common/phone/phone.interface';
import {
  IOrgRequest,
  BaseOrgRequestRepo,
  EOrgRequestStatus,
} from 'src/common/repos/orgRequest';
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

  async rejectOrgRequest(
    id: string,
    rejecterId: string,
    reason?: string | undefined,
  ): Promise<IOrgRequest> {
    const orgRequest = await this.orgRequestRepo.findById(id);

    if (!orgRequest) {
      throw new HttpException(
        `Organisation Request with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.orgRequestRepo.updateById(id, {
      rejectionReason: reason,
      handledBy: rejecterId,
      handledAt: new Date(),
      status: EOrgRequestStatus.REJECTED,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  approveOrgRequest(id: string, approverId: string): Promise<IOrgRequest> {
    throw new Error('Method not implemented.');
  }
}
