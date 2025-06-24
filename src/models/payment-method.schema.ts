import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentMethod extends Document {
  @Prop({ required: true, unique: true })
  key: string; // e.g. 'payme', 'cash', 'bank'

  @Prop({ required: true })
  label: string; // e.g. 'Payme', 'Cash on Delivery', 'Bank Transfer'

  @Prop()
  icon: string; // URL or path to icon

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);