import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'VenteFlash' })
export class VenteFlash extends Document {
  @Prop({ required: true })
  declare id: string;

  @Prop({ required: true })
  designation_fr: string;

  @Prop()
  cover: string;

  @Prop()
  description: string;

  @Prop({ default: '1' })
  publier: string;

  @Prop({ type: Date })
  created_at: Date;

  @Prop({ type: Date })
  updated_at: Date;

  @Prop()
  meta_description_fr: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  alt_cover: string;

  @Prop()
  description_cover: string;

  @Prop()
  meta: string;

  @Prop()
  content_seo: string;

  @Prop()
  review: string;

  @Prop()
  aggregateRating: string;

  @Prop({ type: Date })
  endTime: Date;

  @Prop()
  discount: number;

  // ADD THIS FIELD:
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  products: Types.ObjectId[];
}

export const VenteFlashSchema = SchemaFactory.createForClass(VenteFlash);