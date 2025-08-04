import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly key: string;

  @IsString()
  @IsNotEmpty()
  readonly display_name: string;

  @IsString()
  @IsOptional()
  readonly value?: string;

  @IsString()
  @IsOptional()
  readonly details?: string;

  @IsString()
  @IsIn(['text', 'image'])
  readonly type: string;

  @IsString()
  @IsNotEmpty()
  readonly order: string;

  @IsString()
  @IsNotEmpty()
  readonly group: string;
}
