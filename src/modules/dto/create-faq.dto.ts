import { IsOptional, IsString } from 'class-validator';

export class CreateFaqDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;
}