import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from './product.schema';
import { Commande } from './commande.schema';
import { Client } from './client.schema';

@Schema()
export class InvoiceItem {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop({ required: true })
  quantity: number;i

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  taxRate: number;
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop([InvoiceItemSchema])
  items: InvoiceItem[];

  @Prop()
  invoiceNumber: string; // numero

  @Prop()
  subtotal: number; // prix_ht

  @Prop()
  tax: number; // tva

  @Prop()
  total: number; // prix_ttc

  @Prop({ default: 0 })
  remise: number; // discount amount

  @Prop({ default: 0 })
  pourcentage_remise: number; // discount percent

  @Prop({ default: 1 })
  timbre: number; // stamp duty

  @Prop({ enum: ['ticket', 'facture'], default: 'ticket' })
  type: 'ticket' | 'facture';

  @Prop({ enum: ['cb', 'virement', 'espece'], default: 'espece' })
  paymentMode: 'cb' | 'virement' | 'espece';

  @Prop({ enum: ['b2b', 'b2c'], default: 'b2c' })
  clientType: 'b2b' | 'b2c';

  @Prop()
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Commande' })
  commande: Types.ObjectId | Commande;

  @Prop({ type: Types.ObjectId, ref: 'Client' })
  client: Types.ObjectId | Client;

  @Prop()
  user_id: string; // for legacy support

  @Prop()
  client_id: string; // for legacy support

  @Prop()
  created_by: string;

  @Prop()
  updated_by: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);