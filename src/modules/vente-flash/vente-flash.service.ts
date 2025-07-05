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
    return this.venteFlashModel.findOne({ id: Number(id) }).exec();
  }

  // Update a flash sale product
  async update(id: string, updateVenteFlashDto: UpdateVenteFlashDto): Promise<VenteFlash | null> {
    return this.venteFlashModel.findOneAndUpdate({ id: Number(id) }, updateVenteFlashDto, { new: true }).exec();
  }

  // Delete a flash sale product
  async delete(id: string): Promise<VenteFlash | null> {
    return this.venteFlashModel.findOneAndDelete({ id: Number(id) }).exec();
  }
}