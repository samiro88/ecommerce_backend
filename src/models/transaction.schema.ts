import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Transaction extends Document {
  @Prop({ required: true }) orderId: string;
  @Prop({ required: true }) transactionId: string;
  @Prop({ required: true }) status: string;
  @Prop({ required: true }) amount: number;
  @Prop({ default: Date.now }) receivedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
