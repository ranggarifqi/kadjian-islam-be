import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterOrgDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsPhoneNumber()
  @IsNotEmpty()
  mobileNumber: string;

  @IsNotEmpty()
  provinceId: string;

  @IsNotEmpty()
  districtId: string;

  @IsNumber()
  size: number;
}

export class RejectOrgDto {
  reason?: string;
}
