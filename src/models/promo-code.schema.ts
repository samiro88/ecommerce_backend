import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PromoCode extends Document {
  @Prop({ unique: true })
  code: string;

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