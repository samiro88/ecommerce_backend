import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAnnonceDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString() @IsOptional() readonly image_1?: string;
  @IsString() @IsOptional() readonly image_2?: string;
  @IsString() @IsOptional() readonly image_3?: string;
  @IsString() @IsOptional() readonly image_4?: string;
  @IsString() @IsOptional() readonly image_5?: string;
  @IsString() @IsOptional() readonly image_6?: string;
  @IsString() @IsOptional() readonly link_img_1?: string;
  @IsString() @IsOptional() readonly link_img_2?: string;
  @IsString() @IsOptional() readonly link_img_3?: string;
  @IsString() @IsOptional() readonly link_img_4?: string;
  @IsString() @IsOptional() readonly link_img_5?: string;
  @IsString() @IsOptional() readonly link_img_6?: string;
  @IsString() @IsOptional() readonly products_default_cover?: string;
  @IsString() @IsOptional() readonly created_at?: string;
  @IsString() @IsOptional() readonly updated_at?: string;
}
