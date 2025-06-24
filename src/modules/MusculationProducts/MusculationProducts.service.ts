// C:\Users\LENOVO\Desktop\ecommerce\ecommerce-backend\src\modules\MusculationProducts\MusculationProducts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MusculationProduct, MusculationProductDocument } from '../../models/MusculationProducts.schema';
import { CreateMusculationProductDto } from '../dto/create-musculation-product.dto';
import { UpdateMusculationProductDto } from '../dto/update-musculation-product.dto';

@Injectable()
export class MusculationProductService {
  constructor(
    @InjectModel(MusculationProduct.name)
    private musculationProductModel: Model<MusculationProductDocument>,
  ) {}

  async findAll(): Promise<MusculationProduct[]> {
    return await this.musculationProductModel.find().exec();
  }

  async findOne(id: string): Promise<MusculationProduct> {
    const product = await this.musculationProductModel.findOne({ id }).exec();
    if (!product) {
      throw new NotFoundException(`MusculationProduct with id ${id} not found`);
    }
    return product;
  }

  async create(createDto: CreateMusculationProductDto): Promise<MusculationProduct> {
    const created = new this.musculationProductModel(createDto);
    return created.save();
  }

  async update(id: string, updateDto: UpdateMusculationProductDto): Promise<MusculationProduct> {
    const updated = await this.musculationProductModel.findOneAndUpdate(
      { id },
      updateDto,
      { new: true },
    ).exec();
    if (!updated) {
      throw new NotFoundException(`MusculationProduct with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.musculationProductModel.deleteOne({ id }).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException(`MusculationProduct with id ${id} not found`);
    }
    return { deleted: true };
  }

  async findBySlug(slug: string): Promise<MusculationProduct> {
  const product = await this.musculationProductModel.findOne({ slug }).exec();
  if (!product) {
    throw new NotFoundException(`MusculationProduct with slug ${slug} not found`);
  }
  return product;
}
}