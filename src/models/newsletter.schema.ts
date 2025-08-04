import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsletterDocument = Newsletter & Document;

@Schema({ timestamps: false })
export class Newsletter {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  created_at: string;

  @Prop({ required: false })
  updated_at: string;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);
