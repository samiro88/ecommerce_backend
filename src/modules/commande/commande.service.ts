import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Document } from 'mongoose';
import { Commande } from '../../models/commande.schema';
import { NotificationService } from '../../services/notification.service'; // Add this import

@Injectable()
export class CommandeService {
  constructor(@InjectModel(Commande.name) private commandeModel: Model<Commande>, private notificationService: NotificationService) {}

  // Create
  async create(data: Partial<Commande>) {
    const created = new this.commandeModel(data);
    const savedOrder = await created.save();

    // Add this debug log
    console.log('DEBUG: About to call sendOrderNotifications for', savedOrder.numero);

    try {
      await this.notificationService.sendOrderNotifications(
        savedOrder.email,
        savedOrder.phone,
        `${savedOrder.prenom} ${savedOrder.nom}`,
        savedOrder.numero
      );
    } catch (err) {
      console.error('Order notification failed:', err);
    }

    return savedOrder;
   // return created.save();
  }

  // Find all
  async findAll() {
    return this.commandeModel.find().exec();
  }

  // Find one by ID or numero
  async findOne(id: string) {
    let commande: (Commande & Document) | null = null;
    if (isValidObjectId(id)) {
      commande = await this.commandeModel.findById(id).exec();
    }
    // If not found or not a valid ObjectId, try by numero or id field
    if (!commande) {
      commande = await this.commandeModel.findOne({ $or: [{ numero: id }, { id: id }] }).exec();
    }
    if (!commande) throw new NotFoundException('Commande not found');
    return commande;
  }

  // Update
  async update(id: string, data: Partial<Commande>) {
    let updated: (Commande & Document) | null = null;
    if (isValidObjectId(id)) {
      updated = await this.commandeModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }
    if (!updated) {
      updated = await this.commandeModel.findOneAndUpdate(
        { $or: [{ numero: id }, { id: id }] },
        data,
        { new: true }
      ).exec();
    }
    if (!updated) throw new NotFoundException('Commande not found');
    return updated;
  }

  // Delete
  async remove(id: string) {
    let deleted: (Commande & Document) | null = null;
    if (isValidObjectId(id)) {
      deleted = await this.commandeModel.findByIdAndDelete(id).exec();
    }
    if (!deleted) {
      deleted = await this.commandeModel.findOneAndDelete({ $or: [{ numero: id }, { id: id }] }).exec();
    }
    if (!deleted) throw new NotFoundException('Commande not found');
    return deleted;
  }

  // Analytics: Orders by Status (for donut chart)
  async getOrdersByStatus() {
    const agg = await this.commandeModel.aggregate([
      { $group: { _id: "$etat", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } }
    ]);
    return {
      labels: agg.map((c) => c.status),
      data: agg.map((c) => c.count)
    };
  }

  // Analytics: Orders by Country (pays)
  async getOrdersByCountry() {
    const agg = await this.commandeModel.aggregate([
      { $group: { _id: "$pays", count: { $sum: 1 } } },
      { $project: { _id: 0, country: "$_id", count: 1 } }
    ]);
    return {
      labels: agg.map((c) => c.country),
      data: agg.map((c) => c.count)
    };
  }

  async findByNumero(numero: string) {
    const commande: (Commande & Document) | null = await this.commandeModel.findOne({ numero }).exec();
    if (!commande) throw new NotFoundException('Commande not found');
    return commande;
  }
}
