import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SeoPageDocument = SeoPage & Document;

@Schema({ timestamps: false, collection: 'seo_pages' })
export class SeoPage {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  page: string;

  @Prop({ required: false })
  meta: string;

  @Prop({ required: false })
  description_fr: string;

  @Prop({ required: false })
  nutrition_values: string;

  @Prop({ required: false })
  questions: string;

  @Prop({ required: false })
  zone1: string;

  @Prop({ required: false })
  zone2: string;

  @Prop({ required: false })
  zone3: string;

  @Prop({ required: false })
  more_details: string;

  @Prop({ required: false })
  created_at: string;

  @Prop({ required: false })
  updated_at: string;
}

export const SeoPageSchema = SchemaFactory.createForClass(SeoPage);
