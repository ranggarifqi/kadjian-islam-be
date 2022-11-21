import {
  IsAlphanumeric,
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class RegisterOrgDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  name: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  description: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  address: string;

  @IsEmail()
  email?: string | null;

  @IsMobilePhone()
  @IsNotEmpty()
  mobileNumber: string;

  @IsNotEmpty()
  provinceId: string;

  @IsNotEmpty()
  districtId: string;

  @IsNumber()
  size: number;
}
