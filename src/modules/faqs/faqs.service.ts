import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FAQ } from '../../models/faq.schema';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(@InjectModel(FAQ.name) private faqModel: Model<FAQ>) {}

  async findAll() {
    return this.faqModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string) {
    const faq = await this.faqModel.findById(id);
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async create(createFaqDto: CreateFaqDto) {
    try {
      const created = new this.faqModel(createFaqDto);
      return await created.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateFaqDto: UpdateFaqDto) {
    const updated = await this.faqModel.findByIdAndUpdate(id, updateFaqDto, { new: true, runValidators: true });
    if (!updated) throw new NotFoundException('FAQ not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.faqModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('FAQ not found');
    return { message: 'FAQ deleted successfully' };
  }
}