import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: false, collection: 'contacts' })
export class Contact {
  @Prop({ required: false, unique: false })
  id: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  message: string;

  @Prop({ required: false })
  created_at: string;

  @Prop({ required: false })
  updated_at: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);