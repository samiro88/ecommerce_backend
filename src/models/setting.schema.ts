import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true })
export class Setting {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  display_name: string;

  @Prop({ required: false })
  value: string;

  @Prop({ required: false })
  details: string;

  @Prop({ required: true, enum: ['text', 'image'] })
  type: string;

  @Prop({ required: true })
  order: string;

  @Prop({ required: true })
  group: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
