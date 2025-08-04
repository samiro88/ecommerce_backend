import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCoordinatesDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString() @IsOptional() readonly designation_fr?: string;
  @IsString() @IsOptional() readonly abbreviation?: string;
  @IsString() @IsOptional() readonly matricule?: string;
  @IsString() @IsOptional() readonly rib?: string;
  @IsString() @IsOptional() readonly email?: string;
  @IsString() @IsOptional() readonly adresse_fr?: string;
  @IsString() @IsOptional() readonly phone_1?: string;
  @IsString() @IsOptional() readonly phone_2?: string;
  @IsString() @IsOptional() readonly cover?: string;
  @IsString() @IsOptional() readonly site_web?: string;
  @IsString() @IsOptional() readonly facebook_link?: string;
  @IsString() @IsOptional() readonly youtube_link?: string;
  @IsString() @IsOptional() readonly favicon?: string;
  @IsString() @IsOptional() readonly logo?: string;
  @IsString() @IsOptional() readonly logo_facture?: string;
  @IsString() @IsOptional() readonly logo_footer?: string;
  @IsString() @IsOptional() readonly short_description_fr?: string;
  @IsString() @IsOptional() readonly description_fr?: string;
  @IsString() @IsOptional() readonly created_by?: string;
  @IsString() @IsOptional() readonly updated_by?: string;
  @IsString() @IsOptional() readonly created_at?: string;
  @IsString() @IsOptional() readonly updated_at?: string;
  @IsString() @IsOptional() readonly timbre?: string;
  @IsString() @IsOptional() readonly tva?: string;
  @IsString() @IsOptional() readonly short_description_ticket?: string;
  @IsString() @IsOptional() readonly footer_ticket?: string;
  @IsString() @IsOptional() readonly registre_commerce?: string;
  @IsString() @IsOptional() readonly note?: string;
  @IsString() @IsOptional() readonly twitter_link?: string;
  @IsString() @IsOptional() readonly instagram_link?: string;
  @IsString() @IsOptional() readonly linkedin_link?: string;
  @IsString() @IsOptional() readonly a_propos?: string;
  @IsString() @IsOptional() readonly frais_livraison?: string;
  @IsString() @IsOptional() readonly social_media_text_fr?: string;
  @IsString() @IsOptional() readonly newsletter_text_fr?: string;
  @IsString() @IsOptional() readonly store_text_fr?: string;
  @IsString() @IsOptional() readonly appstore_link?: string;
  @IsString() @IsOptional() readonly playstore_link?: string;
  @IsString() @IsOptional() readonly gelocalisation?: string;
  @IsString() @IsOptional() readonly copyright?: string;
  @IsString() @IsOptional() readonly whatsapp_link?: string;
  @IsString() @IsOptional() readonly tiktok_link?: string;
  @IsString() @IsOptional() readonly title_faq?: string;
}
