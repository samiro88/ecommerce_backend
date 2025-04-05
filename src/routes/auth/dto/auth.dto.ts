import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class ClientLoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class ClientRegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}