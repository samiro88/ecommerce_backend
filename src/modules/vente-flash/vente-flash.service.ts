
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

  // Create a new flash sale
  async create(createVenteFlashDto: CreateVenteFlashDto): Promise<VenteFlash | null> {
    const createdVenteFlash = new this.venteFlashModel(createVenteFlashDto);
    return createdVenteFlash.save();
  }

  // Get all flash sales, sorted by sort_order ascending (lowest first)
  async findAll(): Promise<VenteFlash[]> {
    console.log('Fetching all VenteFlash documents...');
    const results = await this.venteFlashModel
      .find({ publier: '1' })
      .sort({ sort_order: 1 }) // <-- sort by sort_order ascending
      .exec();
    console.log('Query results:', results);
    return results;
  }

  // Get a specific flash sale by ID
  async findOne(id: string): Promise<VenteFlash | null> {
    return this.venteFlashModel.findOne({ id }).exec();
  }

  // Update a flash sale
  async update(id: string, updateVenteFlashDto: UpdateVenteFlashDto): Promise<VenteFlash | null> {
    return this.venteFlashModel.findOneAndUpdate({ id }, updateVenteFlashDto, { new: true }).exec();
  }

  // Delete a flash sale
  async delete(id: string): Promise<VenteFlash | null> {
    return this.venteFlashModel.findOneAndDelete({ id }).exec();
  }

  async getFlashSaleProducts(id: string): Promise<any> {
    const flashSale = await this.venteFlashModel.findOne({ id }).populate('products').exec();
    if (flashSale) {
      return (flashSale as any).products;
    } else {
      return null; // or throw an error, depending on your requirements
    }
  }
}
