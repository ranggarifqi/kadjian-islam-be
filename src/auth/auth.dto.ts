import { IsEmail, IsNotEmpty, Length } from 'class-validator';

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
}

export class LoginDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
