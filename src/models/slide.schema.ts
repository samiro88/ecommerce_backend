import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SlideDocument = Slide & Document;

@Schema({ timestamps: false })
export class Slide {
  @Prop({ required: false, unique: false })
  id: string;

  @Prop({ required: false })
  cover: string;

  @Prop({ required: false })
  designation_fr: string;

  @Prop({ required: false })
  description_fr: string;

  @Prop({ required: false })
  btn_text_fr: string;

  @Prop({ required: false })
  btn_link: string;

  @Prop({ required: false })
  created_at: string;

  @Prop({ required: false })
  updated_at: string;

  @Prop({ required: false })
  position: string;

  @Prop({ required: false })
  text_color: string;

  @Prop({ required: false })
  text_weight: string;

  @Prop({ required: false })
  type: string;
}

export const SlideSchema = SchemaFactory.createForClass(Slide);
