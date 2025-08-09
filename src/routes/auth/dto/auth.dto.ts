// auth.dto.ts
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class ClientLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AdminLoginDto {
  @IsString()
  identifier: string; // username or email

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

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;
}