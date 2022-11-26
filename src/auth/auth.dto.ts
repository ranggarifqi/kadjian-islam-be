import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
} from 'class-validator';
import { GenderStr } from 'src/common/repos/user';

export class RegisterUserDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6)
  rawPassword: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  gender: GenderStr;

  @IsOptional()
  provinceId?: string;

  @IsOptional()
  districtId?: string;
}

export class LoginDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class ChangeOrgDTO {
  @IsNotEmpty()
  @IsUUID()
  organisationId: string;
}
