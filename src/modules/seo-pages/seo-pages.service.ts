import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SeoPage, SeoPageDocument } from '../../models/seo-page.schema';
import { CreateSeoPageDto } from '../dto/create-seo-page.dto';
import { UpdateSeoPageDto } from '../dto/update-seo-page.dto';

@Injectable()
export class SeoPagesService {
  constructor(
    @InjectModel(SeoPage.name) private seoPageModel: Model<SeoPageDocument>,
  ) {}

  async create(createSeoPageDto: CreateSeoPageDto): Promise<SeoPage> {
    const exists = await this.seoPageModel.findOne({ id: createSeoPageDto.id });
    if (exists) {
      throw new ConflictException('SeoPage with this id already exists');
    }
    const created = new this.seoPageModel(createSeoPageDto);
    return created.save();
  }

  async findAll(): Promise<SeoPage[]> {
    return this.seoPageModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<SeoPage> {
    const seoPage = await this.seoPageModel.findOne({ id });
    if (!seoPage) {
      throw new NotFoundException('SeoPage not found');
    }
    return seoPage;
  }

  async update(id: string, updateSeoPageDto: UpdateSeoPageDto): Promise<SeoPage> {
    const updated = await this.seoPageModel.findOneAndUpdate(
      { id },
      { $set: updateSeoPageDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('SeoPage not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.seoPageModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('SeoPage not found');
    }
  }
}
