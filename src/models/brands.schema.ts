

// --- brands.schema.ts ---
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'brands' })
export class Brand extends Document {
  @Prop({ required: true })
declare id: string;

  @Prop({ required: true })
  designation_fr: string;

  @Prop()
  logo: string;

  @Prop()
  description_fr: string;

  @Prop()
  created_at: string;

  @Prop()
  updated_at: string;

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

  @Prop()
  nutrition_values: string;

  @Prop()
  questions: string;

  @Prop()
  more_details: string;

  // Link to aromas (array of ObjectId references)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Aroma' }], default: [] })
  aromas: Types.ObjectId[];
}

export const BrandSchema = SchemaFactory.createForClass(Brand);