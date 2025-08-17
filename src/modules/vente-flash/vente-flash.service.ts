import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VenteFlash } from '../../models/vente-flash.schema';
import { CreateVenteFlashDto } from './dto/create-vente-flash.dto';
import { UpdateVenteFlashDto } from './dto/update-vente-flash.dto';

@Injectable()
export class VenteFlashService {
  constructor(
    @InjectModel('VenteFlash') private readonly venteFlashModel: Model<VenteFlash>,
  ) {}

  // Create a new flash sale product
  async create(createVenteFlashDto: CreateVenteFlashDto): Promise<VenteFlash | null> {
    // Generate unique ID if not provided
    if (!createVenteFlashDto.id) {
      const lastProduct = await this.venteFlashModel.findOne().sort({ id: -1 }).exec();
      createVenteFlashDto.id = lastProduct ? lastProduct.id + 1 : 1;
    }
    // Convert string id to number if needed
    if (typeof createVenteFlashDto.id === 'string') {
      createVenteFlashDto.id = parseInt(createVenteFlashDto.id);
    }
    const createdVenteFlash = new this.venteFlashModel(createVenteFlashDto);
    return createdVenteFlash.save();
  }

  // Get all flash sale products
  async findAll(): Promise<VenteFlash[]> {
  const dbName = this.venteFlashModel.db.name;
  const collectionName = this.venteFlashModel.collection.name;
  console.log('Connected to DB:', dbName, 'Collection:', collectionName);
  const docs = await this.venteFlashModel.find().exec();
  console.log('VenteFlash documents found:', docs);
  return docs;
}

  // Get a specific flash sale product by ID
  async findOne(id: string): Promise<VenteFlash | null> {
    // Try to find by MongoDB _id first, then by custom id field
    let product = await this.venteFlashModel.findById(id).exec();
    if (!product) {
      product = await this.venteFlashModel.findOne({ id: Number(id) }).exec();
    }
    return product;
  }

  // Update a flash sale product
  async update(id: string, updateVenteFlashDto: UpdateVenteFlashDto): Promise<VenteFlash | null> {
    // Try to update by MongoDB _id first, then by custom id field
    let product = await this.venteFlashModel.findByIdAndUpdate(id, updateVenteFlashDto, { new: true }).exec();
    if (!product) {
      product = await this.venteFlashModel.findOneAndUpdate({ id: Number(id) }, updateVenteFlashDto, { new: true }).exec();
    }
    return product;
  }

  // Delete a flash sale product
  async delete(id: string): Promise<VenteFlash | null> {
    // Try to delete by MongoDB _id first, then by custom id field
    let product = await this.venteFlashModel.findByIdAndDelete(id).exec();
    if (!product) {
      product = await this.venteFlashModel.findOneAndDelete({ id: Number(id) }).exec();
    }
    return product;
  }
}