import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MusculationProductDocument = MusculationProduct & Document;

@Schema({ collection: 'MusculationProducts', timestamps: false })
export class MusculationProduct {


  @Prop({ type: String })
  id: string;

  @Prop({ type: String })
  sous_categorie_id: string;

  @Prop({ type: String })
  designation_fr: string;

  @Prop({ type: String })
  cover: string;

  @Prop({ type: String })
  qte: string;

  @Prop({ type: String, required: false })
  prix_ht?: string;

  @Prop({ type: String })
  prix: string;

  @Prop({ type: String, required: false })
  promo_ht?: string;

  @Prop({ type: String, required: false })
  promo?: string;

  @Prop({ type: String })
  description_fr: string;

  @Prop({ type: String })
  publier: string;

  @Prop({ type: String, required: false })
  created_by?: string;

  @Prop({ type: String, required: false })
  updated_by?: string;

  @Prop({ type: String })
  created_at: string;

  @Prop({ type: String })
  updated_at: string;

  @Prop({ type: String, required: false })
  code_product?: string;

  @Prop({ type: String })
  slug: string;

  @Prop({ type: String })
  pack: string;

  @Prop({ type: String })
  brand_id: string;

  @Prop({ type: String })
  new_product: string;

  @Prop({ type: String })
  best_seller: string;

  @Prop({ type: String })
  gallery: string;

  @Prop({ type: String })
  note: string;

  @Prop({ type: String })
  meta_description_fr: string;

  @Prop({ type: String, required: false })
  promo_expiration_date?: string;

  @Prop({ type: String })
  rupture: string;

  @Prop({ type: String, required: false })
  alt_cover?: string;

  @Prop({ type: String, required: false })
  description_cover?: string;

  @Prop({ type: String, required: false })
  meta?: string;

  @Prop({ type: String, required: false })
  content_seo?: string;

  @Prop({ type: String, required: false })
  review?: string;

  @Prop({ type: String, required: false })
  aggregateRating?: string;

  @Prop({ type: String, required: false })
  nutrition_values?: string;

  @Prop({ type: String, required: false })
  questions?: string;

  @Prop({ type: String })
  zone1: string;

  @Prop({ type: String })
  zone2: string;

  @Prop({ type: String })
  zone3: string;

  @Prop({ type: String })
  zone4: string;

  // For articles (optional fields)
  @Prop({ type: String, required: false })
  categorie_id?: string;
  
  @Prop({ type: String, required: false })
  description?: string;
  
  @Prop({ type: String, required: false })
  more_details?: string;
}

export const MusculationProductSchema = SchemaFactory.createForClass(MusculationProduct);