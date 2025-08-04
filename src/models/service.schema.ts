import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: false })
export class Service {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  designation_fr: string;

  @Prop({ required: true })
  description_fr: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: false })
  created_at: string;

  @Prop({ required: false })
  updated_at: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
