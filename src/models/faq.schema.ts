import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class FAQ extends Document {
  @Prop({ required: true })
  declare id: string; // <-- Use declare to avoid TS error

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;
}

export const FAQSchema = SchemaFactory.createForClass(FAQ);