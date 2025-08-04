import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnnonceDocument = Annonce & Document;

@Schema({ timestamps: false })
export class Annonce {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop() image_1: string;
  @Prop() image_2: string;
  @Prop() image_3: string;
  @Prop() image_4: string;
  @Prop() image_5: string;
  @Prop() image_6: string;
  @Prop() link_img_1: string;
  @Prop() link_img_2: string;
  @Prop() link_img_3: string;
  @Prop() link_img_4: string;
  @Prop() link_img_5: string;
  @Prop() link_img_6: string;
  @Prop() products_default_cover: string;
  @Prop() created_at: string;
  @Prop() updated_at: string;
}

export const AnnonceSchema = SchemaFactory.createForClass(Annonce);
