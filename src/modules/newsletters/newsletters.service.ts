import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from '../../models/newsletter.schema';
import { CreateNewsletterDto } from '../dto/create-newsletter.dto';
import { UpdateNewsletterDto } from '../dto/update-newsletter.dto';

@Injectable()
export class NewslettersService {
  constructor(
    @InjectModel(Newsletter.name) private newsletterModel: Model<NewsletterDocument>,
  ) {}

  async create(createNewsletterDto: CreateNewsletterDto): Promise<Newsletter> {
    // Generate id if not provided or empty
    const id = createNewsletterDto.id && createNewsletterDto.id.trim() !== '' 
      ? createNewsletterDto.id 
      : `newsletter-${Date.now()}`;
    
    // Only check for duplicates if we have a real ID
    if (createNewsletterDto.id && createNewsletterDto.id.trim() !== '') {
      const exists = await this.newsletterModel.findOne({ id });
      if (exists) {
        throw new ConflictException('Newsletter with this id already exists');
      }
    }
    
    const created = new this.newsletterModel({ ...createNewsletterDto, id });
    return created.save();
  }

  async findAll(): Promise<Newsletter[]> {
    return this.newsletterModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<Newsletter> {
    const newsletter = await this.newsletterModel.findOne({ id });
    if (!newsletter) {
      throw new NotFoundException('Newsletter not found');
    }
    return newsletter;
  }

  async update(id: string, updateNewsletterDto: UpdateNewsletterDto): Promise<Newsletter> {
    // Try to update by id field first, then by _id if not found
    let updated = await this.newsletterModel.findOneAndUpdate(
      { id },
      { $set: updateNewsletterDto },
      { new: true },
    );
    
    if (!updated) {
      // Try updating by MongoDB _id
      updated = await this.newsletterModel.findByIdAndUpdate(id, updateNewsletterDto, { new: true });
    }
    
    if (!updated) {
      throw new NotFoundException('Newsletter not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    // Try to delete by id field first, then by _id if not found
    let deleted = await this.newsletterModel.findOneAndDelete({ id });
    
    if (!deleted) {
      // Try deleting by MongoDB _id
      deleted = await this.newsletterModel.findByIdAndDelete(id);
    }
    
    if (!deleted) {
      throw new NotFoundException('Newsletter not found');
    }
  }
}
