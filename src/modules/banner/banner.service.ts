import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery, UpdateResult, DeleteResult } from 'mongoose';
import { Banner } from '../../models/banner.schema';

@Injectable()
export class BannerService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<Banner>) {}

  /**
   * Create a single banner.
   */
  async create(data: Partial<Banner>) {
    return new this.bannerModel(data).save();
  }

  /**
   * Bulk create banners.
   */
  async createMany(banners: Partial<Banner>[]) {
    return this.bannerModel.insertMany(banners);
  }

  /**
   * Find all banners, with optional filter.
   */
  async findAll(filter: FilterQuery<Banner> = {}) {
    return this.bannerModel.find(filter).exec();
  }

  /**
   * Find one banner by MongoDB _id.
   */
  async findOne(id: string) {
    const banner = await this.bannerModel.findById(id).exec();
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  /**
   * Find one banner by any field(s).
   */
  async findOneByFields(fields: FilterQuery<Banner>) {
    const banner = await this.bannerModel.findOne(fields).exec();
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  /**
   * Update a banner by _id.
   */
  async update(id: string, data: Partial<Banner>) {
    const updated = await this.bannerModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Banner not found');
    return updated;
  }

  /**
   * Update banners by filter.
   */
  async updateMany(
    filter: FilterQuery<Banner>,
    update: UpdateQuery<Banner>
  ): Promise<UpdateResult> {
    return this.bannerModel.updateMany(filter, update).exec();
  }

  /**
   * Remove a banner by _id.
   */
  async remove(id: string) {
    const deleted = await this.bannerModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Banner not found');
    return deleted;
  }

  /**
   * Remove banners by filter.
   */
  async removeMany(filter: FilterQuery<Banner>): Promise<DeleteResult> {
    return this.bannerModel.deleteMany(filter).exec();
  }

  /**
   * Count banners by filter.
   */
  async count(filter: FilterQuery<Banner> = {}) {
    return this.bannerModel.countDocuments(filter).exec();
  }
}