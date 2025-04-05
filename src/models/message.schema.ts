import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  subject: string;

  @Prop()
  message: string;

  @Prop({ default: 'Unread' })
  status: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);