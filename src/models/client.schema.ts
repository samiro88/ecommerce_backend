import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone1: string;

  @Prop()
  phone2: string;

  @Prop()
  ville: string;

  @Prop()
  address: string;

  @Prop({ default: false })
  subscriber: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Vente' }] })
  ordersId: Types.ObjectId[];

  @Prop({
    type: [{
      productId: { type: Types.ObjectId, ref: 'Product' },
      quantity: Number,
      gout: String
    }]
  })
  cart: {
    productId: Types.ObjectId;
    quantity: number;
    gout: string;
  }[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  wishlist: Types.ObjectId[];

  @Prop({ default: true })
  isGuest: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);