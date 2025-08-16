import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class FAQ extends Document {
  @Prop()
  declare id: string;

  @Prop()
  question: string;

  @Prop()
  answer: string;
}

export const FAQSchema = SchemaFactory.createForClass(FAQ);