
// --- aromas.service.ts ---
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aroma } from '../../models/aromas.schema';
import { Model, Types } from 'mongoose';
import { Brand } from '../../models/brands.schema';

@Injectable()
export class AromasService {
  constructor(
    @InjectModel(Aroma.name) private aromaModel: Model<Aroma>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
  ) {}

  async findAll(): Promise<Aroma[]> {
    return this.aromaModel.find().populate('brand').exec();
  }

  async findOne(id: string): Promise<Aroma> {
    const aroma = await this.aromaModel.findById(id).populate('brand').exec();
    if (!aroma) throw new NotFoundException('Aroma not found');
    return aroma;
  }

  async create(data: Partial<Aroma>): Promise<Aroma> {
    // Generate ID if not provided
    const aromaData = {
      ...data,
      id: data.id || Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Only validate brand if provided
    if (aromaData.brand) {
      const brandExists = await this.brandModel.exists({ _id: aromaData.brand });
      if (!brandExists) throw new NotFoundException('Brand not found');
    }
    
    const created = new this.aromaModel(aromaData);
    return created.save();
  }

  async update(id: string, data: Partial<Aroma>): Promise<Aroma> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    // Only validate brand if provided
    if (updateData.brand) {
      const brandExists = await this.brandModel.exists({ _id: updateData.brand });
      if (!brandExists) throw new NotFoundException('Brand not found');
    }
    
    const updated = await this.aromaModel.findByIdAndUpdate(id, updateData, { new: true }).populate('brand').exec();
    if (!updated) throw new NotFoundException('Aroma not found');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.aromaModel.findByIdAndDelete(id).exec();
    return { deleted: !!res };
  }

  // Get aromas for a brand
  async findByBrand(brandId: string): Promise<Aroma[]> {
    return this.aromaModel.find({ brand: new Types.ObjectId(brandId) }).populate('brand').exec();
  }
}