// client.schema.ts
import { Schema, Document } from 'mongoose';

export const ClientSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  isGuest: { type: Boolean, default: true },
  subscriber: { type: Boolean, default: false },
  name: String,
  phone1: String,
  phone2: String,
  ville: String,
  address: String,
  cart: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    },
  ],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
});

export interface Client extends Document {
  email: string;
  password: string;
  isGuest: boolean;
  subscriber: boolean;
  name: string;
  phone1: string;
  phone2: string;
  ville: string;
  address: string;
  cart: { productId: string; quantity: number }[];
  wishlist: string[];
}
