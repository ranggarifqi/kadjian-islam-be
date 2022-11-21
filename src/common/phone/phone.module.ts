import { Module } from '@nestjs/common';
import { LibPhoneNumberService } from './libPhoneNumber.service';
import { BasePhoneService } from './phone.interface';

@Module({
  providers: [{ provide: BasePhoneService, useClass: LibPhoneNumberService }],
})
export class PhoneModule {}
