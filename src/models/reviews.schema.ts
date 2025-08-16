
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'reviews', timestamps: false })
export class Review extends Document {
  @Prop({ required: false })
  declare id: string;

  @Prop({ required: false, type: String })
  user_id: string;

  @Prop({ required: false, type: String })
  product_id: string;

  @Prop({ required: false, type: String })
  stars: string;

  @Prop({ type: String, default: null })
  comment: string | null;

  @Prop({ required: false, type: String })
  publier: string;

  @Prop({ required: false, type: String })
  created_at: string;

  @Prop({ required: false, type: String })
  updated_at: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
