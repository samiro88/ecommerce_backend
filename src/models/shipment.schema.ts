import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Shipment extends Document {
  @Prop({ required: true, unique: true })
  awbNumber: string;

  @Prop({ required: true })
  labelUrl: string;

  @Prop({ type: Object, required: true })
  shipmentDetails: Record<string, any>;

  @Prop()
  references: string[];

  @Prop()
  returnAwbNumber: string;

  @Prop({ default: 'created' })
  status: string;
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);