
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Client } from './client.schema';
import { PromoCode } from './promo-code.schema';
import { Product } from './product.schema';
import { Pack } from './pack.schema';

@Schema({ timestamps: true })
export class Vente extends Document {
  @Prop()
  reference: string;

  @Prop({
    type: {
      id: { type: Types.ObjectId, ref: 'Client' },
      name: String,
      phone: String,
      email: String,
      address: String,
      ville: String,
      country: String, // <-- Added country field
      clientNote: String,
      phone1: String,
      phone2: String,
    },
  })
  client: {
    id: Types.ObjectId | Client;
    name: string;
    phone: string;
    email: string;
    address: string;
    ville: string;
    country?: string; // <-- Added country field (optional for backward compatibility)
    clientNote: string;
    phone1: string;
    phone2: string;
  };

  @Prop({
    type: {
      name: String,
      cin: String,
      carNumber: String,
    },
  })
  livreur: {
    name: string;
    cin: string;
    carNumber: string;
  };

  @Prop({
    type: [{
      type: { type: String, enum: ['Product', 'Pack'] },
      itemId: { type: Types.ObjectId, refPath: 'items.type' },
      designation: String,
      quantity: Number,
      price: Number,
      oldPrice: Number,
      variant: String,
    }],
  })
  items: Array<{
    type: 'Product' | 'Pack';
    itemId: Types.ObjectId | Product | Pack;
    designation: string;
    quantity: number;
    price: number;
    oldPrice: number;
    variant: string;
  }>;

  @Prop()
  tva: number;

  @Prop()
  discount: number;

  @Prop()
  totalHT: number;

  @Prop()
  additionalCharges: number;

  @Prop()
  totalTTC: number;

  @Prop()
  livraison: number;

  @Prop()
  netAPayer: number;

  @Prop()
  modePayment: string;

  @Prop()
  date: Date;

  @Prop()
  note: string;

  @Prop({
    type: {
      id: { type: Types.ObjectId, ref: 'PromoCode' },
      code: String,
      value: Number,
    },
  })
  promoCode: {
    id: Types.ObjectId | PromoCode;
    code: string;
    value: number;
  };

  @Prop({ default: 'pending' })
  status: string;
}

export const VenteSchema = SchemaFactory.createForClass(Vente);
