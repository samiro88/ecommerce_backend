import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, ClientSession } from 'mongoose';
  import { Decimal } from 'decimal.js';
  import { Vente } from '../models/Ventes';
  import { Client } from '../models/Client';
  import { PromoCode } from '../models/PromoCode';
  import { Product } from '../models/Product';
  import { Pack } from '../models/Pack';
  import { Information } from '../models/Information';
  import { generateReference } from '../utils/generateReference';
  import { InjectConnection } from '@nestjs/mongoose';
  import * as mongoose from 'mongoose';
  
  @Injectable()
  export class VentesService {
    constructor(
      @InjectModel(Vente.name) private venteModel: Model<Vente>,
      @InjectModel(Client.name) private clientModel: Model<Client>,
      @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCode>,
      @InjectModel(Product.name) private productModel: Model<Product>,
      @InjectModel(Pack.name) private packModel: Model<Pack>,
      @InjectModel(Information.name) private informationModel: Model<Information>,
      @InjectConnection() private readonly connection: mongoose.Connection,
    ) {}
  
    async create(createVenteDto: CreateVenteDto) {
      const session = await this.connection.startSession();
      session.startTransaction();
  
      try {
        const reference = await generateReference();
        const advancedInfo = await this.informationModel.findOne().select('advanced -_id').lean();
        
        // Client handling
        let clientId = createVenteDto.clientId;
        if (createVenteDto.isNewClient && createVenteDto.client) {
          const newClient = await this.clientModel.create([{
            name: createVenteDto.client.name || '',
            email: createVenteDto.client.email || '',
            phone1: createVenteDto.client.phone1 || '',
            address: createVenteDto.client.address || '',
            ville: createVenteDto.client.ville || '',
          }], { session });
          clientId = newClient[0]._id;
        } else if (clientId) {
          const clientExists = await this.clientModel.findById(clientId).session(session);
          if (!clientExists) {
            throw new BadRequestException('Client not found');
          }
        }
  
        // Promo code validation
        let promotionCode = null;
        if (createVenteDto.promoCode) {
          promotionCode = await this.promoCodeModel.findOne({ code: createVenteDto.promoCode }).session(session);
          if (!promotionCode) {
            throw new BadRequestException('Promotion code not found');
          }
        }
  
        // Initialize Decimal values
        let tva = new Decimal(0);
        let totalHT = new Decimal(0);
        let livraisonCost = new Decimal(createVenteDto.livraison || 0);
        let productDiscount = new Decimal(0);
        let packDiscount = new Decimal(0);
        let discount = new Decimal(0);
        let totalTTC = new Decimal(0);
        const taxRate = new Decimal(advancedInfo.advanced.tva || 0.19);
  
        // Process items
        for (const item of createVenteDto.items) {
          let currentItem;
          if (item.type === 'Product') {
            currentItem = await this.productModel.findById(item.itemId).session(session);
            if (!currentItem) {
              throw new BadRequestException(`Product with id ${item.itemId} not found`);
            }
          } else if (item.type === 'Pack') {
            currentItem = await this.packModel.findById(item.itemId).session(session);
            if (!currentItem) {
              throw new BadRequestException(`Pack with id ${item.itemId} not found`);
            }
          }
  
          const currentPrice = new Decimal(currentItem.price.toString());
          const oldPrice = currentItem.oldPrice ? new Decimal(currentItem.oldPrice.toString()) : null;
  
          if (oldPrice) {
            if (item.type === 'Product') {
              productDiscount = productDiscount.plus(oldPrice.minus(currentPrice).times(item.quantity));
            } else {
              packDiscount = packDiscount.plus(oldPrice.minus(currentPrice).times(item.quantity));
            }
          }
  
          const itemTotal = currentPrice.times(item.quantity);
          totalHT = totalHT.plus(itemTotal);
          tva = tva.plus(currentPrice.times(taxRate).times(item.quantity));
        }
  
        // Calculate totals
        totalTTC = totalHT
          .plus(tva)
          .plus(createVenteDto.additionalCharges || 0)
          .plus(livraisonCost)
          .plus(advancedInfo.advanced.timber);
  
        // Apply promo code discount
        if (promotionCode?.isActive || promotionCode?.endDate > new Date()) {
          discount = discount.plus(totalTTC.times(promotionCode.discount));
        }
        discount = discount.plus(createVenteDto.additionalDiscount || 0);
  
        const netAPayer = totalTTC.minus(discount);
  
        // Create vente
        const [vente] = await this.venteModel.create([{
          createdAt: createVenteDto.createdAt ? new Date(createVenteDto.createdAt) : new Date(),
          reference,
          client: {
            id: clientId,
            name: createVenteDto.client?.name || '',
            email: createVenteDto.client?.email || '',
            phone1: createVenteDto.client?.phone1 || '',
            phone2: createVenteDto.client?.phone2 || '',
            ville: createVenteDto.client?.ville || '',
            address: createVenteDto.client?.address || '',
            clientNote: createVenteDto.client?.clientNote || '',
          },
          livreur: {
            name: createVenteDto.livreur?.name || '',
            cin: createVenteDto.livreur?.cin || '',
            carNumber: createVenteDto.livreur?.carNumber || '',
          },
          items: createVenteDto.items,
          tva: tva.toFixed(3),
          totalHT: totalHT.toFixed(3),
          totalTTC: totalTTC.toFixed(3),
          livraison: livraisonCost.toFixed(3),
          discount: discount.toFixed(3),
          additionalCharges: createVenteDto.additionalCharges?.toFixed(3) || '0.000',
          productsDiscount: productDiscount.toFixed(3),
          netAPayer: netAPayer.toFixed(3),
          note: createVenteDto.note || '',
          modePayment: createVenteDto.modePayment || 'CASH',
          status: createVenteDto.status || 'pending',
          promoCode: promotionCode ? {
            id: promotionCode._id,
            code: promotionCode.code,
            value: promotionCode.discount,
          } : '',
        }], { session });
  
        await session.commitTransaction();
        return { success: true, reference: vente.reference };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  
    async createCommande(commandeVenteDto: CommandeVenteDto) {
      const session = await this.connection.startSession();
      session.startTransaction();
  
      try {
        const reference = await generateReference();
        const advancedInfo = await this.informationModel.findOne().select('advanced -_id').lean();
  
        // Client handling
        let clientId;
        const clientExists = await this.clientModel.findOne({
          $and: [
            { email: commandeVenteDto.client.email },
            { phone1: commandeVenteDto.client.phone1 }
          ]
        }).session(session);
  
        if (!clientExists) {
          const [newClient] = await this.clientModel.create([{
            name: commandeVenteDto.client.name || '',
            email: commandeVenteDto.client.email || '',
            phone1: commandeVenteDto.client.phone1 || '',
            address: commandeVenteDto.client.address || '',
            ville: commandeVenteDto.client.ville || '',
          }], { session });
          clientId = newClient._id;
        } else {
          clientId = clientExists._id;
        }
  
        // Promo code validation
        let promotionCode = null;
        if (commandeVenteDto.promoCode) {
          promotionCode = await this.promoCodeModel.findOne({ code: commandeVenteDto.promoCode }).session(session);
          if (!promotionCode) {
            throw new BadRequestException('Promotion code not found');
          }
        }
  
        // Initialize Decimal values
        let tva = new Decimal(0);
        let totalHT = new Decimal(0);
        let livraisonCost = new Decimal(commandeVenteDto.livraison || 0);
        let productDiscount = new Decimal(0);
        let packDiscount = new Decimal(0);
        let discount = new Decimal(0);
        let totalTTC = new Decimal(0);
        const taxRate = new Decimal(advancedInfo.advanced.tva || 0.19);
  
        // Process items by slug
        const itemsWithIds = [];
        for (const item of commandeVenteDto.items) {
          let currentItem;
          if (item.type === 'Product') {
            currentItem = await this.productModel.findOne({ slug: item.slug }).session(session);
            if (!currentItem) {
              throw new BadRequestException(`Product with slug ${item.slug} not found`);
            }
          } else if (item.type === 'Pack') {
            currentItem = await this.packModel.findOne({ slug: item.slug }).session(session);
            if (!currentItem) {
              throw new BadRequestException(`Pack with slug ${item.slug} not found`);
            }
          }
  
          itemsWithIds.push({
            ...item,
            itemId: currentItem._id
          });
  
          const currentPrice = new Decimal(currentItem.price.toString());
          const oldPrice = currentItem.oldPrice ? new Decimal(currentItem.oldPrice.toString()) : null;
  
          if (oldPrice) {
            const discountAmount = oldPrice.minus(currentPrice).times(item.quantity);
            if (item.type === 'Product') {
              productDiscount = productDiscount.plus(discountAmount);
            } else {
              packDiscount = packDiscount.plus(discountAmount);
            }
          }
  
          const itemTotal = currentPrice.times(item.quantity);
          totalHT = totalHT.plus(itemTotal);
          tva = tva.plus(currentPrice.times(taxRate).times(item.quantity));
        }
  
        // Calculate totals
        totalTTC = totalHT
          .plus(tva)
          .plus(commandeVenteDto.additionalCharges || 0)
          .plus(livraisonCost)
          .plus(advancedInfo.advanced.timber);
  
        // Apply promo code discount
        if (promotionCode?.isActive || promotionCode?.endDate > new Date()) {
          discount = discount.plus(totalTTC.times(promotionCode.discount));
        }
        discount = discount.plus(commandeVenteDto.additionalDiscount || 0);
  
        const netAPayer = totalTTC.minus(discount);
  
        // Create vente
        const [vente] = await this.venteModel.create([{
          reference,
          client: {
            id: clientId,
            name: commandeVenteDto.client.name,
            email: commandeVenteDto.client.email || '',
            phone1: commandeVenteDto.client.phone1,
            phone2: commandeVenteDto.client.phone2 || '',
            ville: commandeVenteDto.client.ville,
            address: commandeVenteDto.client.address,
            clientNote: commandeVenteDto.client.clientNote || '',
          },
          livreur: {
            name: commandeVenteDto.livreur?.name || '',
            cin: commandeVenteDto.livreur?.cin || '',
            carNumber: commandeVenteDto.livreur?.carNumber || '',
          },
          items: itemsWithIds,
          tva: tva.toFixed(3),
          totalHT: totalHT.toFixed(3),
          totalTTC: totalTTC.toFixed(3),
          livraison: livraisonCost.toFixed(3),
          discount: discount.toFixed(3),
          additionalCharges: commandeVenteDto.additionalCharges?.toFixed(3) || '0.000',
          productsDiscount: productDiscount.toFixed(3),
          netAPayer: netAPayer.toFixed(3),
          note: commandeVenteDto.note || '',
          modePayment: commandeVenteDto.modePayment || 'CASH',
          status: commandeVenteDto.status || 'pending',
          promoCode: promotionCode ? {
            id: promotionCode._id,
            code: promotionCode.code,
            value: promotionCode.discount,
          } : '',
        }], { session });
  
        await session.commitTransaction();
        return { success: true, reference: vente.reference };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  
    async findAll() {
      const ventes = await this.venteModel.find()
        .populate('client')
        .populate('promoCode')
        .populate('items.itemId')
        .sort('-reference');
      return { success: true, data: ventes };
    }
  
    async findOne(id: string) {
      const vente = await this.venteModel.findById(id)
        .populate('items.itemId')
        .populate('client')
        .populate('promoCode');
      if (!vente) {
        throw new NotFoundException('Purchase order not found');
      }
      return { success: true, data: vente };
    }
  
    async update(id: string, updateVenteDto: UpdateVenteDto) {
      const session = await this.connection.startSession();
      session.startTransaction();
  
      try {
        const existingVente = await this.venteModel.findById(id).session(session);
        if (!existingVente) {
          throw new NotFoundException('Purchase order not found');
        }
  
        const advancedInfo = await this.informationModel.findOne().select('advanced -_id').lean();
        const taxRate = new Decimal(advancedInfo.advanced.tva || 0.19);
  
        // Initialize values
        let tva = new Decimal(0);
        let totalHT = new Decimal(0);
        let livraisonCost = new Decimal(updateVenteDto.livraison || existingVente.livraison || 0);
        let productDiscount = new Decimal(0);
        let packDiscount = new Decimal(0);
        let discount = new Decimal(0);
        let totalTTC = new Decimal(0);
  
        // Validate new promo code
        let promotionCode = existingVente.promoCode;
        if (updateVenteDto.promoCode) {
          promotionCode = await this.promoCodeModel.findOne({ code: updateVenteDto.promoCode }).session(session);
          if (!promotionCode) {
            throw new BadRequestException('Promotion code not found');
          }
        }
  
        // Process items
        const items = updateVenteDto.items || existingVente.items;
        for (const item of items) {
          let currentItem;
          if (item.type === 'Product') {
            currentItem = await this.productModel.findById(item.itemId).session(session);
          } else if (item.type === 'Pack') {
            currentItem = await this.packModel.findById(item.itemId).session(session);
          }
          if (!currentItem) {
            throw new BadRequestException(`${item.type} with id ${item.itemId} not found`);
          }
  
          const currentPrice = new Decimal(currentItem.price.toString());
          const oldPrice = currentItem.oldPrice ? new Decimal(currentItem.oldPrice.toString()) : null;
  
          if (oldPrice) {
            const discountAmount = oldPrice.minus(currentPrice).times(item.quantity);
            if (item.type === 'Product') {
              productDiscount = productDiscount.plus(discountAmount);
            } else {
              packDiscount = packDiscount.plus(discountAmount);
            }
          }
  
          const itemTotal = currentPrice.times(item.quantity);
          totalHT = totalHT.plus(itemTotal);
          tva = tva.plus(currentPrice.times(taxRate).times(item.quantity));
        }
  
        // Calculate TTC and discounts
        totalTTC = totalHT
          .plus(tva)
          .plus(updateVenteDto.additionalCharges || existingVente.additionalCharges || 0)
          .plus(livraisonCost)
          .plus(advancedInfo.advanced.timber);
  
        if (promotionCode?.isActive || (promotionCode?.endDate && promotionCode.endDate > new Date())) {
          discount = discount.plus(totalTTC.times(promotionCode.discount));
        }
        discount = discount.plus(updateVenteDto.additionalDiscount || existingVente.additionalDiscount || 0);
  
        const netAPayer = totalTTC.minus(discount);
  
        // Construct update data
        const updateData = {
          client: updateVenteDto.client || existingVente.client,
          livreur: {
            name: updateVenteDto.livreur?.name || existingVente.livreur?.name || '',
            cin: updateVenteDto.livreur?.cin || existingVente.livreur?.cin || '',
            carNumber: updateVenteDto.livreur?.carNumber || existingVente.livreur?.carNumber || '',
          },
          items,
          tva: tva.toFixed(3),
          totalHT: totalHT.toFixed(3),
          totalTTC: totalTTC.toFixed(3),
          livraison: livraisonCost.toFixed(3),
          discount: discount.toFixed(3),
          additionalCharges: updateVenteDto.additionalCharges?.toFixed(3) || existingVente.additionalCharges?.toFixed(3) || '0.000',
          productsDiscount: productDiscount.plus(packDiscount).toFixed(3),
          netAPayer: netAPayer.toFixed(3),
          note: updateVenteDto.note || existingVente.note || '',
          modePayment: updateVenteDto.modePayment || existingVente.modePayment || 'CASH',
          status: updateVenteDto.status || existingVente.status || 'pending',
          promoCode: promotionCode ? {
            id: promotionCode._id,
            code: promotionCode.code,
            value: promotionCode.discount,
          } : existingVente.promoCode || '',
        };
  
        // Handle createdAt update separately if needed
        if (updateVenteDto.createdAt) {
          await this.venteModel.collection.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { createdAt: new Date(updateVenteDto.createdAt) } },
            { session }
          );
        }
  
        const updatedVente = await this.venteModel.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
          session,
        })
          .populate('items.itemId')
          .populate('client')
          .populate('promoCode');
  
        await session.commitTransaction();
        return { success: true, data: updatedVente };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  
    async updateStatus(id: string, status: string) {
      const vente = await this.venteModel.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      )
        .populate({
          path: 'items.itemId',
          model: function(doc) {
            return doc.type === 'Product' ? 'Product' : 'Pack';
          },
        })
        .populate('client');
  
      if (!vente) {
        throw new NotFoundException('Purchase order not found');
      }
      return { success: true, data: vente };
    }
  
    async remove(id: string) {
      const vente = await this.venteModel.findByIdAndDelete(id);
      if (!vente) {
        throw new NotFoundException('Purchase order not found');
      }
      return { success: true, message: 'Purchase order deleted successfully' };
    }
  
    async removeMany(ids: string[]) {
      if (!Array.isArray(ids) {
        throw new BadRequestException('IDs must be an array');
      }
  
      const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        throw new BadRequestException({
          message: 'Invalid purchase order ID format',
          invalidIds,
        });
      }
  
      const deleteResult = await this.venteModel.deleteMany({ _id: { $in: ids } });
      if (deleteResult.deletedCount === 0) {
        throw new NotFoundException('No matching purchase orders found to delete');
      }
  
      return {
        message: 'Bulk delete operation completed',
        data: { deletedCount: deleteResult.deletedCount },
      };
    }
  
    async validatePromoCode(code: string) {
      if (!code) {
        throw new BadRequestException('Promo code is required');
      }
  
      const promoCode = await this.promoCodeModel.findOne({ code: code.toString() });
  
      if (
        !promoCode ||
        !promoCode.status ||
        promoCode.endDate < new Date() ||
        promoCode.startDate > new Date()
      ) {
        throw new BadRequestException('Invalid or expired promo code');
      }
  
      return {
        valid: true,
        discountValue: promoCode.discount,
        code: promoCode.code,
      };
    }
  }