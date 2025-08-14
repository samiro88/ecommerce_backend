// --- brands.service.ts ---
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from '../../models/brands.schema';
import { Model, Types } from 'mongoose';
import { Aroma } from '../../models/aromas.schema';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    @InjectModel(Aroma.name) private aromaModel: Model<Aroma>,
  ) {}

  async findAll(): Promise<Brand[]> {
    return this.brandModel.find().populate('aromas').exec();
  }

 // ...existing code...
async findBySlug(slug: string): Promise<Brand[]> {
  // Use a case-insensitive regex to match the slug field
  return this.brandModel.find({ slug: { $regex: new RegExp(`^${slug}$`, 'i') } }).exec();
}
// ...existing code...

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandModel.findById(id).populate('aromas').exec();
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(data: Partial<Brand>): Promise<Brand> {
    // Generate ID if not provided
    const brandData = {
      ...data,
      id: (data as any).id || Math.random().toString(36).substr(2, 9),
      designation_fr: data.designation_fr || 'Untitled Brand',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const created = new this.brandModel(brandData);
    return created.save();
  }

  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    // Clean the data to handle problematic fields
    const cleanData = { ...data } as any;
    
    // Handle aromas field - remove if empty string or invalid
    if (typeof cleanData.aromas === 'string' && (cleanData.aromas === '' || cleanData.aromas === "[ '' ]")) {
      delete cleanData.aromas;
    }
    
    // Remove fields that shouldn't be updated
    delete cleanData._id;
    delete cleanData.__v;
    
    const updateData = {
      ...cleanData,
      updated_at: new Date().toISOString(),
    };
    
    const updated = await this.brandModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updated) throw new NotFoundException('Brand not found');
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.brandModel.findByIdAndDelete(id).exec();
    return { deleted: !!res };
  }

  // Link aromas to brand (set or add)
  async setAromas(brandId: string, aromaIds: string[]): Promise<Brand> {
    const brand = await this.brandModel.findByIdAndUpdate(
      brandId,
      { aromas: aromaIds.map(id => new Types.ObjectId(id)) },
      { new: true },
    ).populate('aromas');
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  // Get aromas for a brand
  async getAromas(brandId: string): Promise<Aroma[]> {
  const brand = await this.brandModel.findById(brandId).populate('aromas').exec();
  if (!brand) throw new NotFoundException('Brand not found');
  return brand.aromas as unknown as Aroma[];
}
}