
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'reviews', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Review extends Document {
  @Prop({ required: true })
  declare id: string;

  @Prop({ required: true, type: String })
  user_id: string;

  @Prop({ required: true, type: String })
  product_id: string;

  @Prop({ required: true, type: String })
  stars: string;

  @Prop({ type: String, default: null })
  comment: string | null;

  @Prop({ required: true, type: String })
  publier: string;

  @Prop({ type: Date })
  created_at: Date;

  @Prop({ type: Date })
  updated_at: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
