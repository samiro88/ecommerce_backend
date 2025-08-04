import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSlideDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly cover: string;

  @IsString()
  @IsOptional()
  readonly designation_fr?: string;

  @IsString()
  @IsOptional()
  readonly description_fr?: string;

  @IsString()
  @IsOptional()
  readonly btn_text_fr?: string;

  @IsString()
  @IsOptional()
  readonly btn_link?: string;

  @IsString()
  @IsOptional()
  readonly created_at?: string;

  @IsString()
  @IsOptional()
  readonly updated_at?: string;

  @IsString()
  @IsOptional()
  readonly position?: string;

  @IsString()
  @IsOptional()
  readonly text_color?: string;

  @IsString()
  @IsOptional()
  readonly text_weight?: string;

  @IsString()
  @IsOptional()
  readonly type?: string;
}
