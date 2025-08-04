import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: false })
export class Tag {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  designation_fr: string;

  @Prop({ required: false })
  created_at: string;

  @Prop({ required: false })
  updated_at: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
