// auth.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class ClientLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AdminLoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class ClientRegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  phone1: string;

  @IsString()
  ville: string;

  @IsString()
  address: string;
}

export class AdminRegisterDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  role?: string;
}