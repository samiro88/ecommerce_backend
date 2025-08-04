import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Slide, SlideDocument } from '../../models/slide.schema';
import { CreateSlideDto } from '../dto/create-slide.dto';
import { UpdateSlideDto } from '../dto/update-slide.dto';

@Injectable()
export class SlidesService {
  constructor(
    @InjectModel(Slide.name) private slideModel: Model<SlideDocument>,
  ) {}

  async create(createSlideDto: CreateSlideDto): Promise<Slide> {
    const exists = await this.slideModel.findOne({ id: createSlideDto.id });
    if (exists) {
      throw new ConflictException('Slide with this id already exists');
    }
    const created = new this.slideModel(createSlideDto);
    return created.save();
  }

  async findAll(): Promise<Slide[]> {
    return this.slideModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<Slide> {
    const slide = await this.slideModel.findOne({ id });
    if (!slide) {
      throw new NotFoundException('Slide not found');
    }
    return slide;
  }

  async update(id: string, updateSlideDto: UpdateSlideDto): Promise<Slide> {
    const updated = await this.slideModel.findOneAndUpdate(
      { id },
      { $set: updateSlideDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Slide not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.slideModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('Slide not found');
    }
  }
}
