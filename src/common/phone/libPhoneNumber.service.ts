import { Injectable } from '@nestjs/common';
import { parsePhoneNumber } from 'libphonenumber-js';
import { BasePhoneService } from './phone.interface';

@Injectable()
export class LibPhoneNumberService extends BasePhoneService {
  splitCountryCodeAndNumber(phoneNumber: string): {
    countryCode: string;
    phoneNumber: string;
  } {
    const parsed = parsePhoneNumber(phoneNumber, 'ID');

    return {
      countryCode: '+' + parsed.countryCallingCode,
      phoneNumber: parsed.nationalNumber,
    };
  }
}
