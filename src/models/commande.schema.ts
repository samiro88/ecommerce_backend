// src/models/commande.schema.ts
import { Schema, Document, model } from 'mongoose';

export interface Commande extends Document {
  reference: string;
  client: {
    id: string;
    name: string;
    email?: string;
    phone1: string;
    phone2?: string;
    ville: string;
    address: string;
    clientNote?: string;
  };
  items: Array<{
    itemId: string;
    type: 'Product' | 'Pack';
    quantity: number;
  }>;
  totalHT: number;
  totalTTC: number;
  discount: number;
  netAPayer: number;
  status: string;
  createdAt: Date;
}

export const CommandeSchema = new Schema<Commande>({
  reference: { type: String, required: true },
  client: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone1: { type: String, required: true },
    phone2: { type: String },
    ville: { type: String, required: true },
    address: { type: String, required: true },
    clientNote: { type: String },
  },
  items: [
    {
      itemId: { type: String, required: true },
      type: { type: String, enum: ['Product', 'Pack'], required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalHT: { type: Number, required: true },
  totalTTC: { type: Number, required: true },
  discount: { type: Number, required: true },
  netAPayer: { type: Number, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
