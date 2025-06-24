import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invoice } from '../models/invoice.schema';
import { Product } from '../models/product.schema';
import { Commande } from '../models/commande.schema';
import { Client } from '../models/client.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Commande.name) private readonly commandeModel: Model<Commande>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
  ) {}

  async createInvoice(data: {
    items: { productId: string; quantity: number }[];
    date?: string;
    type?: 'ticket' | 'facture';
    paymentMode?: 'cb' | 'virement' | 'espece';
    clientType?: 'b2b' | 'b2c';
    remise?: number;
    pourcentage_remise?: number;
    timbre?: number;
    invoiceNumber?: string;
    commandeId?: string;
    clientId?: string;
    user_id?: string;
    client_id?: string;
    created_by?: string;
    updated_by?: string;
  }) {
    const {
      items,
      date,
      type,
      paymentMode,
      clientType,
      remise = 0,
      pourcentage_remise = 0,
      timbre = 1,
      invoiceNumber,
      commandeId,
      clientId,
      user_id,
      client_id,
      created_by,
      updated_by,
    } = data;

    const populatedItems = await Promise.all(
      items.map(async ({ productId, quantity }) => {
        const product = await this.productModel.findById(productId);
        const price = product?.price || 0;
        const taxRate = product?.taxRate || 0;
        return {
          product: product ? product._id : null,
          quantity,
          price,
          taxRate,
        };
      }),
    );

    let subtotal = populatedItems.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0,
    );

    // Apply remise (discount)
    let remiseAmount = remise;
    if (pourcentage_remise && pourcentage_remise > 0) {
      remiseAmount = subtotal * (pourcentage_remise / 100);
    }
    subtotal = subtotal - remiseAmount;

    const tax = populatedItems.reduce(
      (sum, item) =>
        sum + ((item.price || 0) * item.quantity * (item.taxRate || 0)) / 100,
      0,
    );

    const total = subtotal + tax + (timbre || 0);

    const invoice = new this.invoiceModel({
      items: populatedItems,
      subtotal,
      tax,
      total,
      remise: remiseAmount,
      pourcentage_remise,
      timbre,
      invoiceNumber,
      type: type || 'ticket',
      paymentMode: paymentMode || 'espece',
      clientType: clientType || 'b2c',
      date: date ? new Date(date) : new Date(),
      commande: commandeId ? new Types.ObjectId(commandeId) : undefined,
      client: clientId ? new Types.ObjectId(clientId) : undefined,
      user_id,
      client_id,
      created_by,
      updated_by,
    });

    return invoice.save();
  }

  async updateInvoice(id: string, update: Partial<Invoice>) {
    return this.invoiceModel.findByIdAndUpdate(id, update, { new: true });
  }

  async updateInvoiceDate(id: string, newDate: string) {
    return this.invoiceModel.findByIdAndUpdate(
      id,
      { date: new Date(newDate) },
      { new: true },
    );
  }

  async getInvoice(id: string) {
    return this.invoiceModel
      .findById(id)
      .populate('items.product')
      .populate('commande')
      .populate('client')
      .exec();
  }

  async getAllInvoices(filter: any = {}) {
    return this.invoiceModel
      .find(filter)
      .populate('items.product')
      .populate('commande')
      .populate('client')
      .sort({ createdAt: -1 })
      .exec();
  }

  async deleteInvoice(id: string) {
    return this.invoiceModel.findByIdAndDelete(id);
  }
}