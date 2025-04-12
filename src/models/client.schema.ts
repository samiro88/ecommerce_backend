import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone1?: string;

  @Prop()
  phone2?: string;

  @Prop()
  ville?: string;

  @Prop()
  address?: string;

  @Prop({ default: false })
  subscriber: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Vente' }], default: [] })
  ordersId: Types.ObjectId[];

  @Prop({
    type: [{
      productId: { type: Types.ObjectId, ref: 'Product' },
      quantity: Number,
      gout: String
    }],
    default: []
  })
  cart: {
    productId: Types.ObjectId;
    quantity: number;
    gout: string;
  }[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  wishlist: Types.ObjectId[];

  @Prop({ default: true })
  isGuest: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

// Add this to properly type the _id field
export type ClientDocument = Client & Document & {
  _id: Types.ObjectId;
};