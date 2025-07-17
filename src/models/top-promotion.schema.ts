import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'top_promotions' })
export class TopPromotion extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true }) // <-- Add ref: 'Product'
  productId: Types.ObjectId;

  @Prop({ required: true })
  designation_fr: string;

  @Prop({ required: true })
  prix: number;

  @Prop({ required: true })
  promo: number;

  @Prop({ required: true })
  qte: number;

  @Prop()
  rupture: string;

  @Prop()
  publier: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  active: boolean;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const TopPromotionSchema = SchemaFactory.createForClass(TopPromotion);
