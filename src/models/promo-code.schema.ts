import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PromoCode extends Document {
  @Prop({ unique: true })
  code: string;
  
  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ required: true })
  validFrom: Date;

  @Prop({ required: true })
  validUntil: Date;

  @Prop()
  minOrderAmount: number;

  @Prop({ default: true })
  isActive: boolean;
  @Prop()
  discount: number;

  @Prop({ default: () => new Date() })
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: true })
  status: boolean;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);