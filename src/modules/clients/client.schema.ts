import { Schema, Document } from 'mongoose';

export const ClientSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  isGuest: { type: Boolean, default: true },
    name: String,
  phone_1: String,
  phone_2: String,
  ville: String,
  adresse: String,
  matricule: String, // Optional, if you want to use it
  cart: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    },
  ],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  created_by: String,
  updated_by: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  sms: { type: String, default: "0" },
});

export interface Client extends Document {
  email: string;
  password: string;
  isGuest: boolean;
    name: string;
  phone_1: string;
  phone_2: string;
  ville: string;
  adresse: string;
  matricule?: string;
  cart: { productId: string; quantity: number }[];
  wishlist: string[];
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
  sms?: string;
}