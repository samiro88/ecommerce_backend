import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: false })
export class Service {
  @Prop({ required: false, unique: false })
  id: string;

  @Prop({ required: false })
  designation_fr: string;

  @Prop({ required: false })
  description_fr: string;

  @Prop({ required: false })
  icon: string;

  @Prop({ required: false })
  created_at: string;

  @Prop({ required: false })
  updated_at: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
