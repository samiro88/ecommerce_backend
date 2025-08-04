import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CoordinatesDocument = Coordinates & Document;

@Schema({ timestamps: false })
export class Coordinates {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop() designation_fr: string;
  @Prop() abbreviation: string;
  @Prop() matricule: string;
  @Prop() rib: string;
  @Prop() email: string;
  @Prop() adresse_fr: string;
  @Prop() phone_1: string;
  @Prop() phone_2: string;
  @Prop() cover: string;
  @Prop() site_web: string;
  @Prop() facebook_link: string;
  @Prop() youtube_link: string;
  @Prop() favicon: string;
  @Prop() logo: string;
  @Prop() logo_facture: string;
  @Prop() logo_footer: string;
  @Prop() short_description_fr: string;
  @Prop() description_fr: string;
  @Prop() created_by: string;
  @Prop() updated_by: string;
  @Prop() created_at: string;
  @Prop() updated_at: string;
  @Prop() timbre: string;
  @Prop() tva: string;
  @Prop() short_description_ticket: string;
  @Prop() footer_ticket: string;
  @Prop() registre_commerce: string;
  @Prop() note: string;
  @Prop() twitter_link: string;
  @Prop() instagram_link: string;
  @Prop() linkedin_link: string;
  @Prop() a_propos: string;
  @Prop() frais_livraison: string;
  @Prop() social_media_text_fr: string;
  @Prop() newsletter_text_fr: string;
  @Prop() store_text_fr: string;
  @Prop() appstore_link: string;
  @Prop() playstore_link: string;
  @Prop() gelocalisation: string;
  @Prop() copyright: string;
  @Prop() whatsapp_link: string;
  @Prop() tiktok_link: string;
  @Prop() title_faq: string;
}

export const CoordinatesSchema = SchemaFactory.createForClass(Coordinates);
