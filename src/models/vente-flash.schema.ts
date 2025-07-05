import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'VenteFlash' })
export class VenteFlash extends Document {
  @Prop({ required: true })
  declare id: number;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  designation_fr: string;

  @Prop()
  cover: string;

  @Prop()
  new_product: string;

  @Prop()
  best_seller: string;

  @Prop()
  note: Number;

  @Prop()
  alt_cover: string;

  @Prop()
  description_cover: string;

  @Prop()
  prix: Number;

  @Prop()
  pack: string;

  @Prop()
  promo: Number;

  @Prop()
  promo_expiration_date: string;
}

export const VenteFlashSchema = SchemaFactory.createForClass(VenteFlash);