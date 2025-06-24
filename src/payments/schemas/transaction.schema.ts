
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  orderId: string;
  @Prop()
  paymentToken: string;
  @Prop({ required: true, type: Number })
  amount: number;
  @Prop({ required: true })
  status: string;
  @Prop()
  createdAt?: Date;
  @Prop()
  updatedAt?: Date;
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
